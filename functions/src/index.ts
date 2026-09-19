import {setGlobalOptions} from "firebase-functions";
import {HttpsError, onCall} from "firebase-functions/v2/https";

import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";

/* =========================================================
   FIREBASE ADMIN INITIALIZATION
========================================================= */

initializeApp();

/* =========================================================
   FIREBASE SERVICES
========================================================= */

const db = getFirestore();
const adminAuth = getAuth();

/* =========================================================
   GLOBAL OPTIONS
========================================================= */

setGlobalOptions({
  region: "asia-south1",
  maxInstances: 10,
});

/* =========================================================
   FIREBASE ADMIN ERROR TYPE
========================================================= */

type FirebaseAdminError = {
  code?: unknown;
  message?: unknown;
};

/* =========================================================
   CREATE MEMBER ACCOUNT
========================================================= */

/*
 * Flow:
 *
 * Admin / Coordinator
 *        ↓
 * Add Member
 *        ↓
 * Cloud Function
 *        ↓
 * Firebase Authentication
 *        ↓
 * users/{UID}
 *        ↓
 * coordinator → coordinators/{UID}
 *
 * Password is handled only by Firebase Authentication.
 * Password is NEVER stored in Firestore.
 */

export const createMemberAccount = onCall(
  async (request) => {
    /* =====================================================
       1. VERIFY CALLER LOGIN
    ===================================================== */

    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to create a member account."
      );
    }

    const callerUid = request.auth.uid;

    /* =====================================================
       2. GET CALLER FIRESTORE PROFILE
    ===================================================== */

    const callerRef = db
      .collection("users")
      .doc(callerUid);

    const callerSnap =
      await callerRef.get();

    if (!callerSnap.exists) {
      throw new HttpsError(
        "permission-denied",
        "Your user profile was not found."
      );
    }

    const callerData =
      callerSnap.data();

    const callerRole =
      String(
        callerData?.role || ""
      ).toLowerCase();

    /* =====================================================
       3. VERIFY CALLER ROLE
    ===================================================== */

    if (
      callerRole !== "admin" &&
      callerRole !== "coordinator"
    ) {
      throw new HttpsError(
        "permission-denied",
        "Only Admins and Coordinators can create member accounts."
      );
    }

    /* =====================================================
       4. READ REQUEST DATA
    ===================================================== */

    const data =
      (request.data || {}) as Record<
        string,
        unknown
      >;

    const fullName =
      String(
        data.fullName || ""
      ).trim();

    const username =
      String(
        data.username || ""
      ).trim();

    const email =
      String(
        data.email || ""
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        data.password || ""
      );

    const phone =
      String(
        data.phone || ""
      ).trim();

    const department =
      String(
        data.department || ""
      ).trim();

    const departmentCode =
      String(
        data.departmentCode || ""
      ).trim();

    const year =
      String(
        data.year ||
          "Faculty/Admin"
      ).trim();

    const section =
      String(
        data.section ||
          "N/A"
      ).trim();

    const requestedRole =
      String(
        data.role ||
          "student"
      )
        .trim()
        .toLowerCase();

    const designation =
      String(
        data.designation || ""
      ).trim();

    const academicYear =
      String(
        data.academicYear ||
          "2026-27"
      ).trim();

    const bio =
      String(
        data.bio || ""
      ).trim();

    const photoUrl =
      String(
        data.photoUrl || ""
      ).trim();

    /* =====================================================
       5. VALIDATE REQUIRED DATA
    ===================================================== */

    if (!fullName) {
      throw new HttpsError(
        "invalid-argument",
        "Full name is required."
      );
    }

    if (!username) {
      throw new HttpsError(
        "invalid-argument",
        "Username is required."
      );
    }

    if (!email) {
      throw new HttpsError(
        "invalid-argument",
        "Email address is required."
      );
    }

    if (
      !password ||
      password.length < 6
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Password must contain at least 6 characters."
      );
    }

    if (!phone) {
      throw new HttpsError(
        "invalid-argument",
        "Phone number is required."
      );
    }

    if (!department) {
      throw new HttpsError(
        "invalid-argument",
        "Department is required."
      );
    }

    /* =====================================================
       6. VALIDATE ROLE
    ===================================================== */

    if (
      requestedRole !== "student" &&
      requestedRole !== "coordinator"
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid member role."
      );
    }

    /* =====================================================
       7. COORDINATOR CREATION

       Only Admin can create Coordinators.
    ===================================================== */

    if (
      requestedRole === "coordinator" &&
      callerRole !== "admin"
    ) {
      throw new HttpsError(
        "permission-denied",
        "Only an Admin can create a Coordinator account."
      );
    }

    /* =====================================================
       8. CHECK USERNAME DUPLICATE
    ===================================================== */

    const usernameSnap =
      await db
        .collection("users")
        .where(
          "username",
          "==",
          username
        )
        .limit(1)
        .get();

    if (!usernameSnap.empty) {
      throw new HttpsError(
        "already-exists",
        "This username is already in use."
      );
    }

    /* =====================================================
       9. CREATE FIREBASE AUTH USER
    ===================================================== */

    let firebaseUser;

    try {
      const userOptions = {
        email,
        password,
        displayName: fullName,
        disabled: false,
      } as {
        email: string;
        password: string;
        displayName: string;
        disabled: boolean;
        photoURL?: string;
      };

      if (photoUrl) {
        userOptions.photoURL =
          photoUrl;
      }

      firebaseUser =
        await adminAuth.createUser(
          userOptions
        );
    } catch (
      error: unknown
    ) {
      console.error(
        "Firebase Authentication error:",
        error
      );

      const firebaseAdminError =
        error &&
        typeof error ===
          "object" ?
          (error as FirebaseAdminError) :
          {};

      const firebaseCode =
        String(
          firebaseAdminError.code ||
            ""
        );

      const firebaseMessage =
        String(
          firebaseAdminError.message ||
            ""
        );

      if (
        firebaseCode.includes(
          "email-already-exists"
        ) ||
        firebaseMessage
          .toLowerCase()
          .includes(
            "email already exists"
          )
      ) {
        throw new HttpsError(
          "already-exists",
          "An account already exists with this email address."
        );
      }

      throw new HttpsError(
        "internal",
        "Unable to create Firebase Authentication account."
      );
    }

    const uid =
      firebaseUser.uid;

    /* =====================================================
       10. CREATE FIRESTORE USER PROFILE
    ===================================================== */

    const userProfile = {
      uid,

      fullName,

      name:
        fullName,

      username,

      email,

      phone,

      department,

      departmentCode,

      year,

      section,

      role:
        requestedRole,

      designation,

      academicYear,

      bio,

      photoURL:
        photoUrl,

      avatarUrl:
        photoUrl,

      active:
        true,

      createdAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp(),

      createdBy:
        callerUid,

      updatedBy:
        callerUid,
    };

    await db
      .collection("users")
      .doc(uid)
      .set(userProfile);

    /* =====================================================
       11. CREATE PUBLIC COORDINATOR PROFILE

       Only when role = coordinator.
    ===================================================== */

    if (
      requestedRole ===
      "coordinator"
    ) {
      await db
        .collection("coordinators")
        .doc(uid)
        .set({
          userId:
            uid,

          name:
            fullName,

          designation:
            designation ||
            "Literature Club Coordinator",

          department,

          departmentCode,

          role:
            "Coordinator",

          academicYear,

          bio,

          photoUrl,

          photoPath:
            "",

          active:
            true,

          createdAt:
            FieldValue.serverTimestamp(),

          updatedAt:
            FieldValue.serverTimestamp(),

          createdBy:
            callerUid,

          updatedBy:
            callerUid,
        });
    }

    /* =====================================================
       12. RETURN SAFE DATA

       Password NEVER returned.
    ===================================================== */

    return {
      success: true,

      user: {
        id: uid,

        uid,

        fullName,

        username,

        email,

        phone,

        department,

        departmentCode,

        year,

        section,

        role:
          requestedRole,

        designation,

        academicYear,

        bio,

        photoURL:
          photoUrl,

        avatarUrl:
          photoUrl,

        active:
          true,
      },
    };
  }
);
