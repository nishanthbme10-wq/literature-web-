import {
  ActivityLog,
  AttendanceRecord,
  Certificate,
  CoordinatorRequest,
  FeedbackSubmission,
  FooterConfig,
  GalleryItem,
  HeaderConfig,
  Inquiry,
  MonthlyActivity,
  User,
  Winner,
  Workshop,
} from "../types";

/*
 * Literature Club - V.S.B. Engineering College
 *
 * This file contains the initial/default configuration.
 * Real application data can be loaded from Firebase / backend APIs.
 *
 * The arrays below are intentionally empty until official
 * event, winner, gallery and activity information is provided.
 */

/* =========================
   HEADER CONFIG
   ========================= */

export const initialHeaderConfig: HeaderConfig = {
  siteName: "Literature Club",
  siteSubtitle: "V.S.B. Engineering College",

  // Logos will be connected later.
  leftLogoUrl: "",
  rightLogoUrl: "",

  heroSlogan: "Engineering Minds, Literary Souls.",

  heroSubtext:
    "Where engineering minds meet the power of words, imagination finds its voice. We build with logic, create with creativity, and express with stories.",

  announcementText: "",
  showAnnouncement: false,
};

/* =========================
   FOOTER CONFIG
   ========================= */

export const initialFooterConfig: FooterConfig = {
  aboutText: "",
  contactNote: "",
  copyrightText: "",
  collegeTagline: "",
};

/* =========================
   USERS
   ========================= */

export const initialUsers: User[] = [];

/* =========================
   COORDINATOR REQUESTS
   ========================= */

export const initialCoordinatorRequests: CoordinatorRequest[] = [];

/* =========================
   WORKSHOPS / EVENTS
   ========================= */

export const initialWorkshops: Workshop[] = [];

/* =========================
   WINNERS
   ========================= */

export const initialWinners: Winner[] = [];

/* =========================
   GALLERY
   ========================= */

export const initialGalleryItems: GalleryItem[] = [];

/* =========================
   MONTHLY ACTIVITIES
   ========================= */

export const initialMonthlyActivities: MonthlyActivity[] = [];

/* =========================
   ATTENDANCE
   ========================= */

export const initialAttendanceRecords: AttendanceRecord[] = [];

/* =========================
   FEEDBACK
   ========================= */

export const initialFeedbackSubmissions: FeedbackSubmission[] = [];

/* =========================
   CERTIFICATES
   ========================= */

export const initialCertificates: Certificate[] = [];

/* =========================
   INQUIRIES
   ========================= */

export const initialInquiries: Inquiry[] = [];

/* =========================
   ACTIVITY LOGS
   ========================= */

export const initialActivityLogs: ActivityLog[] = [];