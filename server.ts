import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

import {
  initialHeaderConfig,
  initialUsers,
  initialWorkshops,
  initialWinners,
  initialGalleryItems,
  initialMonthlyActivities,
  initialAttendanceRecords,
  initialFeedbackSubmissions,
  initialCertificates,
  initialActivityLogs,
  initialCoordinatorRequests,
  initialInquiries,
} from "./src/data/mockData.js";

import {
  HeaderConfig,
  User,
  Workshop,
  Winner,
  GalleryItem,
  AttendanceRecord,
  FeedbackSubmission,
  Certificate,
  ActivityLog,
  CoordinatorRequest,
  Inquiry,
  normalizeDepartment,
} from "./src/types.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ============================================================
  // IN-MEMORY DATABASE
  // ============================================================

  let headerConfig: HeaderConfig = { ...initialHeaderConfig };

  let users: User[] = initialUsers.map((user) => ({
    ...user,
  }));

  let coordinatorRequests: CoordinatorRequest[] =
    initialCoordinatorRequests.map((item) => ({
      ...item,
    }));

  let workshops: Workshop[] = initialWorkshops.map((item) => ({
    ...item,
  }));

  let winners: Winner[] = initialWinners.map((item) => ({
    ...item,
  }));

  let galleryItems: GalleryItem[] = initialGalleryItems.map((item) => ({
    ...item,
  }));

  let attendanceRecords: AttendanceRecord[] =
    initialAttendanceRecords.map((item) => ({
      ...item,
    }));

  let feedbackSubmissions: FeedbackSubmission[] =
    initialFeedbackSubmissions.map((item) => ({
      ...item,
    }));

  let certificates: Certificate[] = initialCertificates.map((item) => ({
    ...item,
  }));

  let activityLogs: ActivityLog[] = initialActivityLogs.map((item) => ({
    ...item,
  }));

  let inquiries: Inquiry[] = initialInquiries.map((item) => ({
    ...item,
  }));

  // ============================================================
  // OTP STORE
  // ============================================================

  const otpStore: Record<
    string,
    {
      otp: string;
      expiresAt: number;
    }
  > = {};

  // ============================================================
  // PENDING UPDATES
  // ============================================================

  let pendingUpdatesList: any[] = [];

  // ============================================================
  // HELPERS
  // ============================================================

  const addLog = (
    userRole: "admin" | "coordinator" | "student",
    userName: string,
    action: string,
    details: string
  ) => {
    activityLogs.unshift({
      id:
        "log-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      userRole,
      userName,
      action,
      details,
    });
  };

  const generateId = (prefix: string) => {
    return (
      prefix +
      "-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2, 7)
    );
  };

  /*
   * IMPORTANT:
   * The frontend may send:
   *  - local user.id
   *  - Firebase Auth UID
   *  - firebaseUid
   *  - email
   *
   * This helper supports all of them.
   *
   * This fixes the "User not found" issue when the frontend
   * is using Firebase UID while the old mock database uses
   * another local ID.
   */
  const findUserIndex = (
    requestedId: string,
    body?: {
      email?: string;
      username?: string;
      uid?: string;
      firebaseUid?: string;
    }
  ) => {
    const cleanId = String(requestedId || "").trim();

    const email = String(body?.email || "")
      .trim()
      .toLowerCase();

    const username = String(body?.username || "")
      .trim()
      .toLowerCase();

    const uid = String(body?.uid || body?.firebaseUid || "").trim();

    return users.findIndex((user) => {
      const userAny = user as any;

      const userId = String(user.id || "").trim();

      const userUid = String(
        userAny.uid || userAny.firebaseUid || ""
      ).trim();

      const userEmail = String(user.email || "")
        .trim()
        .toLowerCase();

      const userUsername = String(user.username || "")
        .trim()
        .toLowerCase();

      return (
        userId === cleanId ||
        userUid === cleanId ||
        (uid && userUid === uid) ||
        (email && userEmail === email) ||
        (username && userUsername === username)
      );
    });
  };

  const safeUser = (user: User) => {
    const copy: any = { ...user };

    /*
     * Do not send password to frontend.
     */
    delete copy.password;

    return copy;
  };

  // ============================================================
  // HEALTH CHECK
  // ============================================================

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      time: new Date().toISOString(),
    });
  });

  // ============================================================
  // PENDING UPDATES
  // ============================================================

  app.get("/api/pending-updates", (_req, res) => {
    res.json(pendingUpdatesList);
  });

  app.post("/api/pending-updates/:id/approve", (req, res) => {
    const { id } = req.params;
    const { adminName } = req.body;

    const itemIdx = pendingUpdatesList.findIndex(
      (item) => String(item.id) === String(id)
    );

    if (itemIdx === -1) {
      return res.status(404).json({
        error: "Pending update not found.",
      });
    }

    const item = pendingUpdatesList[itemIdx];

    // ------------------------------------------------------------
    // WORKSHOP
    // ------------------------------------------------------------

    if (item.entityType === "workshop") {
      if (item.actionType === "create") {
        workshops.unshift(item.proposedData);
      }

      if (item.actionType === "update") {
        const index = workshops.findIndex(
          (workshop) => workshop.id === item.entityId
        );

        if (index !== -1) {
          workshops[index] = {
            ...workshops[index],
            ...item.proposedData,
          };
        }
      }

      if (item.actionType === "delete") {
        workshops = workshops.filter(
          (workshop) => workshop.id !== item.entityId
        );
      }
    }

    // ------------------------------------------------------------
    // WINNER
    // ------------------------------------------------------------

    if (item.entityType === "winner") {
      if (item.actionType === "create") {
        winners.unshift(item.proposedData);
      }

      if (item.actionType === "update") {
        const index = winners.findIndex(
          (winner) => winner.id === item.entityId
        );

        if (index !== -1) {
          winners[index] = {
            ...winners[index],
            ...item.proposedData,
          };
        }
      }

      if (item.actionType === "delete") {
        winners = winners.filter(
          (winner) => winner.id !== item.entityId
        );
      }
    }

    // ------------------------------------------------------------
    // GALLERY
    // ------------------------------------------------------------

    if (item.entityType === "gallery") {
      if (item.actionType === "create") {
        galleryItems.unshift(item.proposedData);
      }

      if (item.actionType === "delete") {
        galleryItems = galleryItems.filter(
          (gallery) => gallery.id !== item.entityId
        );
      }
    }

    // ------------------------------------------------------------
    // HEADER
    // ------------------------------------------------------------

    if (item.entityType === "header") {
      headerConfig = {
        ...headerConfig,
        ...item.proposedData,
      };
    }

    pendingUpdatesList.splice(itemIdx, 1);

    addLog(
      "admin",
      adminName || "Admin",
      "Approved Pending Update",
      `Approved ${item.entityType} (${item.actionType}) submitted by ${item.submittedByName}`
    );

    return res.json({
      success: true,
      message: "Update approved and published live!",
    });
  });

  app.post("/api/pending-updates/:id/reject", (req, res) => {
    const { id } = req.params;
    const { adminName, comment } = req.body;

    const itemIdx = pendingUpdatesList.findIndex(
      (item) => String(item.id) === String(id)
    );

    if (itemIdx === -1) {
      return res.status(404).json({
        error: "Pending update not found.",
      });
    }

    const item = pendingUpdatesList[itemIdx];

    pendingUpdatesList.splice(itemIdx, 1);

    addLog(
      "admin",
      adminName || "Admin",
      "Rejected Pending Update",
      `Rejected ${item.entityType} edit from ${
        item.submittedByName
      }. Reason: ${comment || "Not approved"}`
    );

    return res.json({
      success: true,
      message: "Update rejected.",
    });
  });

  // ============================================================
  // HEADER CONFIGURATION
  // ============================================================

  app.get("/api/header", (_req, res) => {
    res.json(headerConfig);
  });

  app.post("/api/header", (req, res) => {
    const {
      siteName,
      siteSubtitle,
      leftLogoUrl,
      rightLogoUrl,
      heroSlogan,
      heroSubtext,
      announcementText,
      showAnnouncement,
      userName,
      userRole,
    } = req.body;

    const newConfig: HeaderConfig = {
      siteName: siteName || headerConfig.siteName,
      siteSubtitle: siteSubtitle || headerConfig.siteSubtitle,
      leftLogoUrl: leftLogoUrl || headerConfig.leftLogoUrl,
      rightLogoUrl: rightLogoUrl || headerConfig.rightLogoUrl,
      heroSlogan: heroSlogan || headerConfig.heroSlogan,
      heroSubtext: heroSubtext || headerConfig.heroSubtext,
      announcementText:
        announcementText !== undefined
          ? announcementText
          : headerConfig.announcementText,
      showAnnouncement:
        showAnnouncement !== undefined
          ? showAnnouncement
          : headerConfig.showAnnouncement,
    };

    if (userRole === "coordinator") {
      const pendingItem = {
        id: generateId("pnd"),
        entityType: "header",
        entityId: "header",
        actionType: "update",
        submittedByUid: "coordinator",
        submittedByName: userName || "Coordinator",
        proposedData: newConfig,
        createdAt: new Date().toISOString(),
      };

      pendingUpdatesList.push(pendingItem);

      addLog(
        "coordinator",
        userName || "Coordinator",
        "Header Update Submitted",
        "Submitted header customization for Admin approval."
      );

      return res.json({
        success: true,
        pending: true,
        message: "Header update submitted for Admin approval.",
      });
    }

    headerConfig = newConfig;

    addLog(
      userRole || "admin",
      userName || "Admin",
      "Header Configuration Updated",
      "Updated site logos, slogan, or header text."
    );

    return res.json({
      success: true,
      config: headerConfig,
    });
  });

  // ============================================================
  // AUTH - REGISTER
  // ============================================================

  app.post("/api/auth/register", (req, res) => {
    const {
      fullName,
      username,
      email,
      phone,
      department,
      year,
      section,
      password,
      isCoordinatorRequest,
      uid,
      firebaseUid,
    } = req.body;

    if (
      !fullName ||
      !username ||
      !email ||
      !phone ||
      !department ||
      !year ||
      !section ||
      !password
    ) {
      return res.status(400).json({
        error: "All required fields must be filled.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUsername = String(username).trim().toLowerCase();

    const existingEmail = users.find(
      (user) => user.email.toLowerCase() === cleanEmail
    );

    if (existingEmail) {
      return res.status(400).json({
        error: "An account with this Email ID already exists.",
      });
    }

    const existingUsername = users.find(
      (user) => user.username.toLowerCase() === cleanUsername
    );

    if (existingUsername) {
      return res.status(400).json({
        error:
          "Username is already taken. Please choose a unique username.",
      });
    }

    const newUserRole: User["role"] = "student";

    const newUser: User = {
      id: generateId("u-stud"),
      fullName: String(fullName).trim(),
      username: String(username).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      department,
      year,
      section,
      role: newUserRole,

      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        String(fullName).trim()
      )}`,

      createdAt: new Date().toISOString(),

      ...(uid || firebaseUid
        ? {
            uid: uid || firebaseUid,
            firebaseUid: firebaseUid || uid,
          }
        : {}),
    } as User;

    users.push(newUser);

    if (isCoordinatorRequest) {
      addLog(
        "student",
        newUser.fullName,
        "Coordinator Request Registered",
        `Registered account and requested Coordinator role for ${newUser.fullName}`
      );
    } else {
      addLog(
        "student",
        newUser.fullName,
        "Student Registered",
        `New student account created for ${newUser.fullName} (${department})`
      );
    }

    return res.json({
      success: true,
      user: safeUser(newUser),
    });
  });

  // ============================================================
  // COORDINATOR REQUESTS
  // ============================================================

  app.get("/api/coordinator-requests", (_req, res) => {
    res.json(coordinatorRequests);
  });

  app.post("/api/coordinator-requests", (req, res) => {
    const {
      fullName,
      department,
      year,
      email,
      phone,
      username,
      password,
      reason,
    } = req.body;

    if (
      !fullName ||
      !department ||
      !year ||
      !email ||
      !phone ||
      !username ||
      !password ||
      !reason
    ) {
      return res.status(400).json({
        error:
          "All required fields must be filled for Coordinator registration request.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUsername = String(username).trim().toLowerCase();

    if (
      users.some(
        (user) =>
          user.email.toLowerCase() === cleanEmail ||
          user.username.toLowerCase() === cleanUsername
      )
    ) {
      return res.status(400).json({
        error: "An account with this Email or Username already exists.",
      });
    }

    if (
      coordinatorRequests.some(
        (request) =>
          request.email.toLowerCase() === cleanEmail ||
          request.username.toLowerCase() === cleanUsername
      )
    ) {
      return res.status(400).json({
        error:
          "A coordinator registration request with this Email or Username already exists.",
      });
    }

    const newRequest: CoordinatorRequest = {
      id: generateId("cr-req"),
      fullName,
      department,
      year,
      email,
      phone,
      username,
      password,
      reason,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    coordinatorRequests.unshift(newRequest);

    addLog(
      "coordinator",
      fullName,
      "Coordinator Request Submitted",
      `Coordinator registration request submitted for ${fullName} (${department}). Status: Pending Admin Approval.`
    );

    return res.json({
      success: true,
      request: newRequest,
      message:
        "Your coordinator registration request has been submitted successfully! Status: Pending Admin Approval.",
    });
  });

  app.post("/api/coordinator-requests/:id/approve", (req, res) => {
    const { id } = req.params;
    const { adminName } = req.body;

    const requestIndex = coordinatorRequests.findIndex(
      (request) => request.id === id
    );

    if (requestIndex === -1) {
      return res.status(404).json({
        error: "Coordinator request not found.",
      });
    }

    const request = coordinatorRequests[requestIndex];

    request.status = "Approved";

    let userObj = users.find(
      (user) => user.email.toLowerCase() === request.email.toLowerCase()
    );

    if (!userObj) {
      userObj = {
        id: generateId("u-coord"),
        fullName: request.fullName,
        username: request.username,
        email: request.email,
        phone: request.phone,
        department: request.department,
        year: request.year as any || "Faculty/Admin",
        section: "N/A",
        role: "coordinator",
        password: request.password,
        createdBy: adminName || "Admin Approval",

        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          request.fullName
        )}`,

        createdAt: new Date().toISOString(),
      } as User;

      users.push(userObj);
    } else {
      userObj.role = "coordinator";
    }

    addLog(
      "admin",
      adminName || "Admin",
      "Approved Coordinator Request",
      `Approved coordinator request for ${request.fullName} (${request.department}).`
    );

    return res.json({
      success: true,
      message: `Coordinator request for ${request.fullName} approved successfully!`,
      user: safeUser(userObj),
    });
  });

  app.post("/api/coordinator-requests/:id/reject", (req, res) => {
    const { id } = req.params;
    const { adminName } = req.body;

    const requestIndex = coordinatorRequests.findIndex(
      (request) => request.id === id
    );

    if (requestIndex === -1) {
      return res.status(404).json({
        error: "Coordinator request not found.",
      });
    }

    coordinatorRequests[requestIndex].status = "Rejected";

    addLog(
      "admin",
      adminName || "Admin",
      "Rejected Coordinator Request",
      `Rejected coordinator request for ${coordinatorRequests[requestIndex].fullName}.`
    );

    return res.json({
      success: true,
      message: "Coordinator request rejected.",
    });
  });

  // ============================================================
  // AUTH - LOGIN
  // ============================================================

  app.post("/api/auth/login", (req, res) => {
    const {
      identifier,
      password,
      targetPortalRole,
    } = req.body;

    if (!identifier) {
      return res.status(400).json({
        error: "Please enter your Username or Email Address.",
      });
    }

    const cleanIdent = String(identifier)
      .toLowerCase()
      .trim();

    const user = users.find(
      (user) =>
        user.email.toLowerCase().trim() === cleanIdent ||
        user.username.toLowerCase().trim() === cleanIdent
    );

    if (user) {
      if (
        user.password &&
        password &&
        user.password !== password
      ) {
        return res.status(401).json({
          error: "Invalid password. Please check your credentials.",
        });
      }

      if (targetPortalRole) {
        if (
          targetPortalRole === "student" &&
          user.role !== "student"
        ) {
          return res.status(403).json({
            error:
              user.role === "coordinator"
                ? "Access denied. This is a Coordinator account. Please use Coordinator Login."
                : "Access denied. This is an Admin account. Please use Admin Login.",
          });
        }

        if (
          targetPortalRole === "coordinator" &&
          user.role !== "coordinator"
        ) {
          return res.status(403).json({
            error:
              user.role === "student"
                ? "Access denied. This is a Student account. Please use Student Login."
                : "Access denied. This is an Admin account. Please use Admin Login.",
          });
        }

        if (
          targetPortalRole === "admin" &&
          user.role !== "admin"
        ) {
          return res.status(403).json({
            error:
              user.role === "student"
                ? "Access denied. This is a Student account. Please use Student Login."
                : "Access denied. This is a Coordinator account. Please use Coordinator Login.",
          });
        }
      }

      addLog(
        user.role,
        user.fullName,
        "Login Success",
        `${user.fullName} logged into ${user.role} portal.`
      );

      return res.json({
        success: true,
        user: safeUser(user),
        sessionToken: `token-${user.role}-${Date.now()}-${user.id}`,
      });
    }

    // ------------------------------------------------------------
    // DEFAULT ADMIN
    // ------------------------------------------------------------

    /*
     * Keep your existing admin credentials in environment variables:
     *
     * DEFAULT_ADMIN_EMAIL
     * DEFAULT_ADMIN_USERNAME
     * DEFAULT_ADMIN_PASSWORD
     *
     * Example:
     * DEFAULT_ADMIN_EMAIL=your-admin-email
     * DEFAULT_ADMIN_USERNAME=your-admin-username
     * DEFAULT_ADMIN_PASSWORD=your-admin-password
     */

    const defaultAdminEmail = String(
      process.env.DEFAULT_ADMIN_EMAIL || ""
    )
      .trim()
      .toLowerCase();

    const defaultAdminUsername = String(
      process.env.DEFAULT_ADMIN_USERNAME || ""
    )
      .trim()
      .toLowerCase();

    const defaultAdminPassword =
      process.env.DEFAULT_ADMIN_PASSWORD || "";

    if (
      (defaultAdminEmail &&
        cleanIdent === defaultAdminEmail) ||
      (defaultAdminUsername &&
        cleanIdent === defaultAdminUsername)
    ) {
      if (
        defaultAdminPassword &&
        password !== defaultAdminPassword
      ) {
        return res.status(401).json({
          error: "Invalid admin password.",
        });
      }

      if (
        targetPortalRole &&
        targetPortalRole !== "admin"
      ) {
        return res.status(403).json({
          error: "Access denied. Please use Admin Login.",
        });
      }

      let defaultAdmin = users.find(
        (user) => user.role === "admin"
      );

      if (!defaultAdmin) {
        defaultAdmin = {
          id: "u-admin-default",
          fullName: "System Admin",
          username:
            defaultAdminUsername || "admin",
          password: defaultAdminPassword,
          email:
            defaultAdminEmail || "admin@vsbliterature.local",
          phone: "",
          department: "CSE",
          year: "Faculty/Admin",
          section: "N/A",
          role: "admin",

          avatarUrl:
            "https://api.dicebear.com/7.x/initials/svg?seed=VSBAdmin",

          createdAt: new Date().toISOString(),
        } as User;

        users.push(defaultAdmin);
      }

      addLog(
        "admin",
        defaultAdmin.fullName,
        "Admin Login",
        "Default Admin logged in."
      );

      return res.json({
        success: true,
        user: safeUser(defaultAdmin),
        sessionToken: `token-admin-${Date.now()}`,
      });
    }

    // ------------------------------------------------------------
    // COORDINATOR PENDING / REJECTED
    // ------------------------------------------------------------

    if (targetPortalRole === "coordinator") {
      const coordReq = coordinatorRequests.find(
        (request) =>
          request.email.toLowerCase().trim() === cleanIdent ||
          request.username.toLowerCase().trim() === cleanIdent
      );

      if (coordReq) {
        if (coordReq.status === "Pending") {
          return res.status(403).json({
            error:
              "Your coordinator request is pending admin approval.",
          });
        }

        if (coordReq.status === "Rejected") {
          return res.status(403).json({
            error:
              "Your coordinator registration request was not approved by the admin.",
          });
        }
      }
    }

    return res.status(404).json({
      error:
        "Account not found. Please verify your credentials or register first.",
    });
  });

  // ============================================================
  // FORGOT PASSWORD
  // ============================================================

  app.post("/api/auth/forgot-password-reset", (req, res) => {
    const { email, newPassword } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Registered Email ID is required.",
      });
    }

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    const userIdx = users.findIndex(
      (user) =>
        user.email.toLowerCase() === cleanEmail
    );

    if (userIdx === -1) {
      return res.status(404).json({
        error:
          "No registered account found associated with this email address.",
      });
    }

    if (newPassword) {
      users[userIdx].password = newPassword;

      addLog(
        users[userIdx].role,
        users[userIdx].fullName,
        "Password Reset",
        `Password reset successfully for ${email}`
      );

      return res.json({
        success: true,
        message:
          "Password reset verified! Your password has been updated successfully. You can now log in.",
      });
    }

    addLog(
      users[userIdx].role,
      users[userIdx].fullName,
      "Reset Link Requested",
      `Password reset link requested for ${email}`
    );

    return res.json({
      success: true,
      message:
        "A secure password reset link has been dispatched.",
      resetUrl: `/reset-password?email=${encodeURIComponent(
        email
      )}`,
    });
  });

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  app.post("/api/users/:id/change-password", (req, res) => {
    const { id } = req.params;
    const {
      currentPassword,
      newPassword,
      email,
      uid,
      firebaseUid,
    } = req.body;

    const userIdx = findUserIndex(id, {
      email,
      uid,
      firebaseUid,
    });

    if (userIdx === -1) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    if (
      users[userIdx].password &&
      users[userIdx].password !== currentPassword
    ) {
      return res.status(400).json({
        error:
          "Current password does not match. Please verify and try again.",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        error: "New password is required.",
      });
    }

    users[userIdx].password = newPassword;

    addLog(
      users[userIdx].role,
      users[userIdx].fullName,
      "Password Changed",
      `Changed password for ${users[userIdx].fullName}`
    );

    return res.json({
      success: true,
      message:
        "Your password has been changed successfully.",
    });
  });

  // ============================================================
  // UPDATE USER PROFILE
  // ============================================================

  /*
   * THIS IS THE MAIN FIX FOR:
   *
   * "User not found."
   *
   * We now support:
   *
   * /api/users/{local-id}
   * /api/users/{firebase-uid}
   *
   * and also email / username fallback from req.body.
   */

  app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;

    const {
      email,
      username,
      password,
      uid,
      firebaseUid,
      ...rest
    } = req.body;

    const userIdx = findUserIndex(id, {
      email,
      username,
      uid,
      firebaseUid,
    });

    // ----------------------------------------------------------
    // USER NOT FOUND
    // ----------------------------------------------------------

    if (userIdx === -1) {
      return res.status(404).json({
        error: "User not found.",
        requestedId: id,
        searchedBy: {
          id,
          email: email || null,
          username: username || null,
          uid: uid || null,
          firebaseUid: firebaseUid || null,
        },
      });
    }

    // ----------------------------------------------------------
    // EMAIL VALIDATION
    // ----------------------------------------------------------

    const cleanEmail = email
      ? String(email).trim()
      : users[userIdx].email;

    if (
      email &&
      cleanEmail.toLowerCase() !==
        users[userIdx].email.toLowerCase()
    ) {
      const emailExists = users.some(
        (user, index) =>
          index !== userIdx &&
          user.email.toLowerCase() ===
            cleanEmail.toLowerCase()
      );

      if (emailExists) {
        return res.status(400).json({
          error:
            "This email address is already registered by another user.",
        });
      }
    }

    // ----------------------------------------------------------
    // USERNAME VALIDATION
    // ----------------------------------------------------------

    const cleanUsername = username
      ? String(username).trim()
      : users[userIdx].username;

    if (
      username &&
      cleanUsername.toLowerCase() !==
        users[userIdx].username.toLowerCase()
    ) {
      const usernameExists = users.some(
        (user, index) =>
          index !== userIdx &&
          user.username.toLowerCase() ===
            cleanUsername.toLowerCase()
      );

      if (usernameExists) {
        return res.status(400).json({
          error:
            "This username is already taken by another user.",
        });
      }
    }

    // ----------------------------------------------------------
    // PASSWORD
    // ----------------------------------------------------------

    const updatedPassword =
      password &&
      String(password).trim().length > 0
        ? String(password)
        : users[userIdx].password;

    // ----------------------------------------------------------
    // PRESERVE FIREBASE UID
    // ----------------------------------------------------------

    const existingUser: any = users[userIdx];

    const resolvedUid =
      uid ||
      firebaseUid ||
      existingUser.uid ||
      existingUser.firebaseUid;

    // ----------------------------------------------------------
    // UPDATE USER
    // ----------------------------------------------------------

    users[userIdx] = {
      ...users[userIdx],
      ...rest,

      email: cleanEmail,
      username: cleanUsername,
      password: updatedPassword,

      ...(resolvedUid
        ? {
            uid: resolvedUid,
            firebaseUid: resolvedUid,
          }
        : {}),
    } as User;

    addLog(
      users[userIdx].role,
      users[userIdx].fullName,
      "Profile Updated",
      `Updated profile information for ${users[userIdx].fullName}`
    );

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: safeUser(users[userIdx]),
    });
  });

  // ============================================================
  // UPDATE USER ROLE
  // ============================================================

  app.put("/api/users/:id/role", (req, res) => {
    const { id } = req.params;
    const {
      newRole,
      adminName,
      email,
      uid,
      firebaseUid,
    } = req.body;

    if (
      newRole !== "student" &&
      newRole !== "coordinator" &&
      newRole !== "admin"
    ) {
      return res.status(400).json({
        error: "Invalid user role.",
      });
    }

    const userIdx = findUserIndex(id, {
      email,
      uid,
      firebaseUid,
    });

    if (userIdx === -1) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    const oldRole = users[userIdx].role;

    users[userIdx].role = newRole;

    addLog(
      "admin",
      adminName || "Admin",
      "User Role Changed",
      `Changed role of ${users[userIdx].fullName} from ${oldRole} to ${newRole}`
    );

    return res.json({
      success: true,
      user: safeUser(users[userIdx]),
    });
  });

  // ============================================================
  // USERS LIST
  // ============================================================

  app.get("/api/users", (_req, res) => {
    res.json(users.map(safeUser));
  });

  // ============================================================
  // CREATE USER
  // ============================================================

  app.post("/api/users", (req, res) => {
    const {
      fullName,
      username,
      email,
      phone,
      department,
      year,
      section,
      role,
      operatorName,
      operatorRole,
      uid,
      firebaseUid,
    } = req.body;

    if (
      !fullName ||
      !username ||
      !email ||
      !phone ||
      !department
    ) {
      return res.status(400).json({
        error:
          "Full name, username, email, phone and department are required.",
      });
    }

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    const cleanUsername = String(username)
      .trim()
      .toLowerCase();

    if (
      users.some(
        (user) =>
          user.email.toLowerCase() === cleanEmail
      )
    ) {
      return res.status(400).json({
        error: "Email already exists.",
      });
    }

    if (
      users.some(
        (user) =>
          user.username.toLowerCase() === cleanUsername
      )
    ) {
      return res.status(400).json({
        error: "Username already exists.",
      });
    }

    const newUser = {
      id: generateId(`u-${role || "student"}`),
      fullName,
      username,
      email,
      phone,
      department,
      year: year || "Faculty/Admin",
      section: section || "N/A",
      role: role || "student",

      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        fullName
      )}`,

      createdAt: new Date().toISOString(),

      ...(uid || firebaseUid
        ? {
            uid: uid || firebaseUid,
            firebaseUid: firebaseUid || uid,
          }
        : {}),
    } as User;

    users.push(newUser);

    addLog(
      operatorRole || "admin",
      operatorName || "Admin",
      "User Created",
      `Added user ${fullName} (${role || "student"})`
    );

    return res.json({
      success: true,
      user: safeUser(newUser),
    });
  });

  // ============================================================
  // DELETE USER
  // ============================================================

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const {
      email,
      uid,
      firebaseUid,
    } = req.body || {};

    const userIdx = findUserIndex(id, {
      email,
      uid,
      firebaseUid,
    });

    if (userIdx === -1) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    const deletedUser = users[userIdx];

    users.splice(userIdx, 1);

    addLog(
      "admin",
      "Admin",
      "User Deleted",
      `Removed user ${deletedUser.fullName} (${deletedUser.id})`
    );

    return res.json({
      success: true,
      message: "User deleted successfully.",
    });
  });

  // ============================================================
  // WORKSHOPS
  // ============================================================

  app.get("/api/workshops", (_req, res) => {
    res.json(workshops);
  });

  app.post("/api/workshops", (req, res) => {
    const {
      title,
      posterUrl,
      dateTime,
      venue,
      resourcePerson,
      description,
      registrationType,
      teamMinSize,
      teamMaxSize,
      googleFormUrl,
      status,
      category,
      operatorName,
      operatorRole,
    } = req.body;

    if (!title || !dateTime || !venue) {
      return res.status(400).json({
        error:
          "Workshop title, date/time and venue are required.",
      });
    }

    const newWs: Workshop = {
      id: generateId("ws"),
      title,
      posterUrl:
        posterUrl ||
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
      dateTime,
      venue,
      resourcePerson,
      description,
      registrationType: registrationType === "team" ? "team" : "individual",
      ...(registrationType === "team"
        ? {
            teamMinSize: Number(teamMinSize || 2),
            teamMaxSize: Number(teamMaxSize || 5),
          }
        : {}),
      googleFormUrl:
        googleFormUrl || "",
      status: status || "Open",
      category:
        category || "Literature Workshop",
      createdById:
        operatorName || "Coordinator",
    };

    if (operatorRole === "coordinator") {
      const pendingItem = {
        id: generateId("pnd"),
        entityType: "workshop",
        entityId: newWs.id,
        actionType: "create",
        submittedByUid: "coordinator",
        submittedByName:
          operatorName || "Coordinator",
        proposedData: newWs,
        createdAt: new Date().toISOString(),
      };

      pendingUpdatesList.push(pendingItem);

      addLog(
        "coordinator",
        operatorName || "Coordinator",
        "Workshop Submitted for Approval",
        `Submitted new workshop "${title}" for Admin approval.`
      );

      return res.json({
        success: true,
        pending: true,
        message:
          "Workshop submitted for Admin approval.",
        workshop: newWs,
      });
    }

    workshops.unshift(newWs);

    addLog(
      operatorRole || "admin",
      operatorName || "Admin",
      "Workshop Created",
      `Created workshop: ${title}`
    );

    return res.json({
      success: true,
      workshop: newWs,
    });
  });

  app.put("/api/workshops/:id", (req, res) => {
    const { id } = req.params;

    const index = workshops.findIndex(
      (workshop) => workshop.id === id
    );

    if (index === -1) {
      return res.status(404).json({
        error: "Workshop not found.",
      });
    }

    const updatedData = {
      ...workshops[index],
      ...req.body,
    };

    if (req.body.operatorRole === "coordinator") {
      const pendingItem = {
        id: generateId("pnd"),
        entityType: "workshop",
        entityId: id,
        actionType: "update",
        submittedByUid: "coordinator",
        submittedByName:
          req.body.operatorName || "Coordinator",
        proposedData: updatedData,
        createdAt: new Date().toISOString(),
      };

      pendingUpdatesList.push(pendingItem);

      addLog(
        "coordinator",
        req.body.operatorName || "Coordinator",
        "Workshop Update Submitted",
        `Submitted update for workshop "${updatedData.title}" for Admin approval.`
      );

      return res.json({
        success: true,
        pending: true,
        message:
          "Workshop update submitted for Admin approval.",
      });
    }

    workshops[index] = updatedData;

    addLog(
      req.body.operatorRole || "admin",
      req.body.operatorName || "Admin",
      "Workshop Updated",
      `Updated workshop: ${workshops[index].title}`
    );

    return res.json({
      success: true,
      workshop: workshops[index],
    });
  });

  app.delete("/api/workshops/:id", (req, res) => {
    const { id } = req.params;

    const {
      operatorRole,
      operatorName,
    } = req.body || {};

    const workshop = workshops.find(
      (item) => item.id === id
    );

    if (!workshop) {
      return res.status(404).json({
        error: "Workshop not found.",
      });
    }

    if (operatorRole === "coordinator") {
      const pendingItem = {
        id: generateId("pnd"),
        entityType: "workshop",
        entityId: id,
        actionType: "delete",
        submittedByUid: "coordinator",
        submittedByName:
          operatorName || "Coordinator",
        proposedData: {
          id,
          title: workshop.title,
        },
        createdAt: new Date().toISOString(),
      };

      pendingUpdatesList.push(pendingItem);

      addLog(
        "coordinator",
        operatorName || "Coordinator",
        "Workshop Deletion Submitted",
        `Submitted deletion request for workshop "${workshop.title}" for Admin approval.`
      );

      return res.json({
        success: true,
        pending: true,
        message:
          "Deletion request submitted for Admin approval.",
      });
    }

    workshops = workshops.filter(
      (item) => item.id !== id
    );

    addLog(
      "admin",
      "Admin",
      "Workshop Deleted",
      `Deleted workshop: ${workshop.title}`
    );

    return res.json({
      success: true,
    });
  });

  // ============================================================
  // WINNERS
  // ============================================================

  app.get("/api/winners", (_req, res) => {
    res.json(winners);
  });

  app.post("/api/winners", (req, res) => {
    const {
      photoUrl,
      name,
      department,
      eventName,
      achievementTitle,
      monthYear,
      operatorName,
      operatorRole,
    } = req.body;

    if (!name || !eventName) {
      return res.status(400).json({
        error: "Winner name and event name are required.",
      });
    }

    const newWinner: Winner = {
      id: generateId("win"),
      photoUrl:
        photoUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
      name,
      department,
      eventName,
      achievementTitle,
      monthYear:
        monthYear || "Current Month",
    };

    if (operatorRole === "coordinator") {
      const pendingItem = {
        id: generateId("pnd"),
        entityType: "winner",
        entityId: newWinner.id,
        actionType: "create",
        submittedByUid: "coordinator",
        submittedByName:
          operatorName || "Coordinator",
        proposedData: newWinner,
        createdAt: new Date().toISOString(),
      };

      pendingUpdatesList.push(pendingItem);

      addLog(
        "coordinator",
        operatorName || "Coordinator",
        "Winner Submitted for Approval",
        `Submitted new winner ${name} for Admin approval.`
      );

      return res.json({
        success: true,
        pending: true,
        message:
          "Winner record submitted for Admin approval.",
        winner: newWinner,
      });
    }

    winners.unshift(newWinner);

    addLog(
      operatorRole || "admin",
      operatorName || "Admin",
      "Winner Added",
      `Added winner ${name} for ${eventName}`
    );

    return res.json({
      success: true,
      winner: newWinner,
    });
  });

  app.put("/api/winners/:id", (req, res) => {
    const { id } = req.params;

    const index = winners.findIndex(
      (winner) => winner.id === id
    );

    if (index === -1) {
      return res.status(404).json({
        error: "Winner not found.",
      });
    }

    winners[index] = {
      ...winners[index],
      ...req.body,
    };

    addLog(
      "admin",
      "Admin",
      "Winner Updated",
      `Updated winner ${winners[index].name}`
    );

    return res.json({
      success: true,
      winner: winners[index],
    });
  });

  app.delete("/api/winners/:id", (req, res) => {
    const { id } = req.params;

    const winner = winners.find(
      (item) => item.id === id
    );

    if (!winner) {
      return res.status(404).json({
        error: "Winner not found.",
      });
    }

    winners = winners.filter(
      (item) => item.id !== id
    );

    addLog(
      "admin",
      "Admin",
      "Winner Removed",
      `Deleted winner record ${id}`
    );

    return res.json({
      success: true,
    });
  });

  // ============================================================
  // GALLERY
  // ============================================================

  app.get("/api/gallery", (_req, res) => {
    res.json(galleryItems);
  });

  app.post("/api/gallery", (req, res) => {
    const {
      album,
      imageUrl,
      title,
      date,
      operatorName,
      operatorRole,
    } = req.body;

    const newItem: GalleryItem = {
      id: generateId("gal"),
      album: album || "General Events",
      imageUrl:
        imageUrl ||
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
      title:
        title || "Literature Club Event Photo",
      date:
        date ||
        new Date().toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        ),
    };

    galleryItems.unshift(newItem);

    addLog(
      operatorRole || "coordinator",
      operatorName || "Coordinator",
      "Gallery Image Uploaded",
      `Uploaded photo to ${album || "General Events"}`
    );

    return res.json({
      success: true,
      item: newItem,
    });
  });

  app.delete("/api/gallery/:id", (req, res) => {
    const { id } = req.params;

    const item = galleryItems.find(
      (gallery) => gallery.id === id
    );

    if (!item) {
      return res.status(404).json({
        error: "Gallery item not found.",
      });
    }

    galleryItems = galleryItems.filter(
      (gallery) => gallery.id !== id
    );

    addLog(
      "admin",
      "Admin",
      "Gallery Image Removed",
      `Removed gallery image ID ${id}`
    );

    return res.json({
      success: true,
    });
  });

  // ============================================================
  // ATTENDANCE
  // ============================================================

  app.get("/api/attendance", (_req, res) => {
    res.json(attendanceRecords);
  });

  app.post("/api/attendance", (req, res) => {
    const {
      workshopId,
      records,
      operatorName,
      operatorRole,
    } = req.body;

    if (!workshopId) {
      return res.status(400).json({
        error: "Workshop ID is required.",
      });
    }

    if (!Array.isArray(records)) {
      return res.status(400).json({
        error: "Attendance records must be an array.",
      });
    }

    const workshop = workshops.find(
      (item) => item.id === workshopId
    );

    const workshopTitle = workshop
      ? workshop.title
      : "Literature Workshop";

    records.forEach((record: any) => {
      const existingIndex =
        attendanceRecords.findIndex(
          (attendance) =>
            attendance.workshopId === workshopId &&
            attendance.studentId === record.studentId
        );

      const newRecord: AttendanceRecord = {
        id:
          existingIndex !== -1
            ? attendanceRecords[existingIndex].id
            : generateId("att"),

        workshopId,
        workshopTitle,

        studentId: record.studentId,
        studentName: record.studentName,

        department:
          record.department || "General",

        year: record.year || "N/A",

        section: record.section || "A",

        status: record.status || "Present",

        markedAt: new Date().toISOString(),
      };

      if (existingIndex !== -1) {
        attendanceRecords[existingIndex] =
          newRecord;
      } else {
        attendanceRecords.push(newRecord);
      }
    });

    addLog(
      operatorRole || "coordinator",
      operatorName || "Coordinator",
      "Attendance Uploaded",
      `Updated attendance for ${records.length} students in ${workshopTitle}`
    );

    return res.json({
      success: true,
      count: records.length,
    });
  });

  // ============================================================
  // FEEDBACK
  // ============================================================

  app.get("/api/feedback", (_req, res) => {
    res.json(feedbackSubmissions);
  });

  app.post("/api/feedback", (req, res) => {
    const {
      workshopId,
      studentId,
      studentName,
      rating,
      comments,
    } = req.body;

    if (!workshopId || !studentId || !studentName) {
      return res.status(400).json({
        error:
          "Workshop ID, student ID and student name are required.",
      });
    }

    const workshop = workshops.find(
      (item) => item.id === workshopId
    );

    const workshopTitle = workshop
      ? workshop.title
      : "Literature Workshop";

    // ----------------------------------------------------------
    // ATTENDANCE ELIGIBILITY
    // ----------------------------------------------------------

    const isPresent =
      attendanceRecords.some(
        (attendance) =>
          attendance.workshopId === workshopId &&
          attendance.studentId === studentId &&
          attendance.status === "Present"
      );

    if (!isPresent) {
      return res.status(400).json({
        error:
          "Only students marked 'Present' for this workshop are eligible to submit feedback and unlock their e-certificate.",
      });
    }

    // ----------------------------------------------------------
    // PREVENT DUPLICATE FEEDBACK
    // ----------------------------------------------------------

    const alreadySubmitted =
      feedbackSubmissions.some(
        (feedback) =>
          feedback.workshopId === workshopId &&
          feedback.studentId === studentId
      );

    if (alreadySubmitted) {
      return res.status(400).json({
        error:
          "You have already submitted feedback for this workshop.",
      });
    }

    const newFeedback: FeedbackSubmission = {
      id: generateId("fb"),
      workshopId,
      workshopTitle,
      studentId,
      studentName,
      rating: Number(rating) || 5,
      comments:
        comments || "Excellent workshop!",
      submittedAt: new Date().toISOString(),
    };

    feedbackSubmissions.push(newFeedback);

    // ----------------------------------------------------------
    // AUTO CERTIFICATE
    // ----------------------------------------------------------

    const student = users.find(
      (user) =>
        user.id === studentId ||
        (user as any).uid === studentId ||
        (user as any).firebaseUid === studentId
    );

    const certificateAlreadyExists =
      certificates.some(
        (certificate) =>
          certificate.workshopId === workshopId &&
          certificate.studentId === studentId
      );

    let newCertificate: Certificate | null =
      null;

    if (!certificateAlreadyExists) {
      const certificateCode =
        "VSB-LC-" +
        new Date().getFullYear() +
        "-" +
        Math.floor(1000 + Math.random() * 9000);

      newCertificate = {
        id: generateId("cert"),
        certificateCode,
        studentId,
        studentName,
        department:
          student?.department || "Engineering",
        workshopId,
        workshopTitle,
        issueDate: new Date()
          .toISOString()
          .split("T")[0],

        coordinatorSignatureName:
          "Faculty In-Charge",

        emailSentStatus: true,
      };

      certificates.push(newCertificate);

      addLog(
        "student",
        studentName,
        "Feedback & Certificate Issued",
        `Submitted feedback and auto-generated Certificate (${certificateCode}) for ${workshopTitle}`
      );
    }

    return res.json({
      success: true,
      feedback: newFeedback,
      certificate: newCertificate,
    });
  });

  // ============================================================
  // CERTIFICATES
  // ============================================================

  app.get("/api/certificates", (_req, res) => {
    res.json(certificates);
  });

  // ============================================================
  // ACTIVITY LOGS
  // ============================================================

  app.get("/api/logs", (_req, res) => {
    res.json(activityLogs);
  });

  // ============================================================
  // INQUIRIES / INBOX
  // ============================================================

  app.get("/api/inquiries", (req, res) => {
    const {
      role,
      department,
      userId,
    } = req.query as {
      role?: string;
      department?: string;
      userId?: string;
    };

    if (!role) {
      return res.status(401).json({
        error:
          "Unauthorized. Authentication role required.",
      });
    }

    // ----------------------------------------------------------
    // ADMIN
    // ----------------------------------------------------------

    if (role === "admin") {
      return res.json(inquiries);
    }

    // ----------------------------------------------------------
    // COORDINATOR
    // ----------------------------------------------------------

    if (role === "coordinator") {
      if (!department && !userId) {
        return res.status(400).json({
          error:
            "Coordinator department or userId required.",
        });
      }

      const coordNormDept =
        normalizeDepartment(department || "");

      const filtered = inquiries.filter(
        (inquiry) => {
          if (
            userId &&
            inquiry.recipientUid === userId
          ) {
            return true;
          }

          if (
            coordNormDept &&
            inquiry.recipientDepartment
          ) {
            return (
              normalizeDepartment(
                inquiry.recipientDepartment
              ) === coordNormDept
            );
          }

          return false;
        }
      );

      return res.json(filtered);
    }

    return res.status(403).json({
      error:
        "Forbidden. Access to staff inbox is restricted.",
    });
  });

  // ============================================================
  // CREATE INQUIRY
  // ============================================================

  app.post("/api/inquiries", (req, res) => {
    const {
      senderName,
      senderEmail,
      senderUid,
      department,
      message,
    } = req.body;

    if (
      !senderName ||
      !senderEmail ||
      !message
    ) {
      return res.status(400).json({
        error:
          "Name, email, and message are required.",
      });
    }

    const rawDept =
      department || "Admin / General Inquiries";

    const normDept =
      normalizeDepartment(rawDept);

    const isForAdmin =
      normDept === "ADMIN" ||
      rawDept.includes("Admin") ||
      rawDept.includes("General");

    const recipientType:
      | "admin"
      | "coordinator" =
      isForAdmin
        ? "admin"
        : "coordinator";

    const recipientDepartment =
      isForAdmin
        ? undefined
        : normDept;

    const newInquiry: Inquiry = {
      id: generateId("inq"),

      senderName,
      senderEmail,
      senderUid:
        senderUid || undefined,

      department: rawDept,
      message,

      recipientType,
      recipientDepartment,

      createdAt:
        new Date().toISOString(),

      status: "unread",
      archived: false,
    };

    inquiries.unshift(newInquiry);

    addLog(
      "student",
      senderName,
      "Inquiry Submitted",
      `Inquiry routed to ${
        isForAdmin
          ? "Admin Inbox"
          : `${recipientDepartment} Coordinator Inbox`
      } from ${senderEmail}`
    );

    return res.json({
      success: true,
      inquiry: newInquiry,
    });
  });

  // ============================================================
  // UPDATE INQUIRY
  // ============================================================

  app.patch("/api/inquiries/:id", (req, res) => {
    const { id } = req.params;

    const {
      status,
      archived,
      replyText,
      repliedBy,
    } = req.body;

    const inquiry = inquiries.find(
      (item) => item.id === id
    );

    if (!inquiry) {
      return res.status(404).json({
        error: "Inquiry not found.",
      });
    }

    if (status !== undefined) {
      inquiry.status = status;
    }

    if (archived !== undefined) {
      inquiry.archived = archived;
    }

    if (replyText !== undefined) {
      inquiry.replyText = replyText;
      inquiry.repliedAt =
        new Date().toISOString();

      inquiry.repliedBy =
        repliedBy || "Staff Member";

      inquiry.status = "read";
    }

    return res.json({
      success: true,
      inquiry,
    });
  });

  // ============================================================
  // DELETE INQUIRY
  // ============================================================

  app.delete("/api/inquiries/:id", (req, res) => {
    const { id } = req.params;

    const index = inquiries.findIndex(
      (item) => item.id === id
    );

    if (index === -1) {
      return res.status(404).json({
        error: "Inquiry not found.",
      });
    }

    const [deleted] =
      inquiries.splice(index, 1);

    addLog(
      "admin",
      "Staff",
      "Inquiry Deleted",
      `Deleted inquiry ${id} from ${deleted.senderName}`
    );

    return res.json({
      success: true,
      deletedId: id,
    });
  });

  // ============================================================
  // ANALYTICS
  // ============================================================

  app.get("/api/analytics", (_req, res) => {
    const totalStudents =
      users.filter(
        (user) => user.role === "student"
      ).length;

    const totalCoordinators =
      users.filter(
        (user) =>
          user.role === "coordinator" ||
          user.role === "admin"
      ).length;

    const totalWorkshops =
      workshops.length;

    const totalPresent =
      attendanceRecords.filter(
        (attendance) =>
          attendance.status === "Present"
      ).length;

    const totalAttendanceRecords =
      attendanceRecords.length;

    const attendancePercentage =
      totalAttendanceRecords > 0
        ? Math.round(
            (totalPresent /
              totalAttendanceRecords) *
              100
          )
        : 0;

    const totalFeedbacks =
      feedbackSubmissions.length;

    const feedbackPercentage =
      totalPresent > 0
        ? Math.min(
            100,
            Math.round(
              (totalFeedbacks /
                totalPresent) *
                100
            )
          )
        : 0;

    const totalCertificates =
      certificates.length;

    const departmentBreakdown: Record<
      string,
      number
    > = {};

    users
      .filter(
        (user) => user.role === "student"
      )
      .forEach((user) => {
        const department =
          user.department || "Unknown";

        departmentBreakdown[department] =
          (departmentBreakdown[department] ||
            0) + 1;
      });

    return res.json({
      totalStudents,
      totalCoordinators,
      totalWorkshops,

      totalAttendanceMarked:
        totalAttendanceRecords,

      attendancePercentage,

      totalFeedbacks,
      feedbackPercentage,

      certificatesIssued:
        totalCertificates,

      departmentBreakdown,
    });
  });

  // ============================================================
  // 404 API HANDLER
  // ============================================================

  app.use("/api", (req, res) => {
    res.status(404).json({
      error: "API endpoint not found.",
      method: req.method,
      path: req.path,
    });
  });

  // ============================================================
  // PRODUCTION / DEVELOPMENT
  // ============================================================

  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(
      process.cwd(),
      "dist"
    );

    app.use(
      express.static(distPath)
    );

    app.get("*", (_req, res) => {
      res.sendFile(
        path.join(
          distPath,
          "index.html"
        )
      );
    });
  } else {
    const vite =
      await createViteServer({
        server: {
          middlewareMode: true,
        },
        appType: "spa",
      });

    app.use(vite.middlewares);
  }

  // ============================================================
  // START SERVER
  // ============================================================

  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `Server running on http://0.0.0.0:${PORT}`
      );
      console.log(
        `Local URL: http://localhost:${PORT}`
      );
    }
  );
}

// ============================================================
// START
// ============================================================

startServer().catch((error) => {
  console.error(
    "Failed to start server:",
    error
  );

  process.exit(1);
});