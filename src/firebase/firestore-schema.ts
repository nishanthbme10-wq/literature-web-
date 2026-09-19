import type { Timestamp } from 'firebase/firestore';

export type UserRole =
  | 'admin'
  | 'coordinator'
  | 'student';

export type RegistrationStatus =
  | 'registered'
  | 'cancelled'
  | 'waitlisted';

export type AttendanceStatus =
  | 'not_marked'
  | 'present'
  | 'absent';

export type EventRegistrationStatus =
  | 'open'
  | 'closed'
  | 'upcoming'
  | 'completed'
  | 'draft';

/* =========================================================
   DEPARTMENT
========================================================= */

export interface DepartmentDocument {
  name: string;
  code: string;
  active: boolean;
  sortOrder: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/* =========================================================
   EVENT
========================================================= */

export interface EventDocument {
  name: string;
  code: string;
  description: string;
  posterUrl: string;
  posterPath?: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  rules: string[];
  registrationDeadline: string;
  maxParticipants: number;
  eligibleDepartments: string[];
  registrationStatus: EventRegistrationStatus;
  createdBy: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/* =========================================================
   USER
========================================================= */

export interface UserDocument {
  fullName: string;
  email: string;
  phone?: string;

  role: UserRole;

  department?: string;
  departmentCode?: string;

  registerNumber?: string;
  year?: string;
  section?: string;

  /*
   * Permanent Literature Club Member ID
   *
   * Example:
   * VSBLC-PULSE-0001
   * VSBLC-GENOME-0001
   */
  clubMemberId?: string;

  /*
   * Existing profile-photo compatibility.
   * Student photo setup is NOT required now.
   */
  photoURL?: string;

  active: boolean;

  createdAt: Timestamp | null;
  updatedAt?: Timestamp | null;
}

/* =========================================================
   COORDINATOR
========================================================= */

export interface CoordinatorDocument {
  userId: string;
  name: string;
  designation: string;
  department: string;
  departmentCode?: string;
  role: string;
  academicYear: string;
  bio: string;
  photoUrl: string;
  photoPath?: string;
  active: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/* =========================================================
   COORDINATOR ASSIGNMENT
========================================================= */

export interface CoordinatorAssignmentDocument {
  coordinatorId: string;
  eventId: string;
  active: boolean;
  assignedAt: Timestamp | null;
  assignedBy: string;
}

/* =========================================================
   REGISTRATION
========================================================= */

export interface RegistrationDocument {
  /*
   * Event-specific registration ID
   *
   * Example:
   * LC26-BME-POE-001
   */
  registrationId: string;

  /*
   * Firebase Authentication UID
   */
  studentUid: string;

  /*
   * Permanent Literature Club Member ID
   *
   * Example:
   * VSBLC-PULSE-0001
   */
  clubMemberId?: string;

  studentName: string;
  registerNumber: string;
  email: string;
  phone: string;

  department: string;
  departmentCode: string;

  year: string;
  section: string;

  eventId: string;
  eventName: string;
  eventCode: string;

  academicYear: string;

  /*
   * Secure QR token for event registration
   */
  qrToken: string;

  registrationStatus: RegistrationStatus;
  attendanceStatus: AttendanceStatus;

  /*
   * Whether authorized coordinators can see this registration
   */
  coordinatorVisible: boolean;

  registeredAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/* =========================================================
   REGISTRATION COUNTER
========================================================= */

export interface RegistrationCounterDocument {
  academicYear: string;
  departmentCode: string;
  eventCode: string;
  lastSerial: number;
  updatedAt: Timestamp | null;
}

/* =========================================================
   LITERATURE CLUB MEMBER COUNTER
========================================================= */

export interface ClubMemberCounterDocument {
  /*
   * Department code
   *
   * Example:
   * BME
   * BT
   * CSE
   */
  department: string;

  /*
   * Department-specific semantic signature
   *
   * Example:
   * BME  -> PULSE
   * BT   -> GENOME
   * CSE  -> CODEX
   */
  signature: string;

  /*
   * Last assigned permanent member number
   */
  lastNumber: number;

  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/* =========================================================
   ATTENDANCE
========================================================= */

export interface AttendanceDocument {
  registrationId: string;

  studentUid: string;

  /*
   * Permanent Literature Club Member ID
   */
  clubMemberId?: string;

  eventId: string;
  eventName: string;

  attendanceStatus:
    | 'present'
    | 'absent';

  attendedAt: Timestamp | null;

  verifiedBy: string;

  verificationMethod:
    | 'qr'
    | 'registration_id'
    | 'register_number'
    | 'manual';
}

/* =========================================================
   GALLERY
========================================================= */

export interface GalleryDocument {
  title: string;
  album: string;
  imageUrl: string;
  imagePath?: string;
  date: string;
  active: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/* =========================================================
   WINNER
========================================================= */

export interface WinnerDocument {
  name: string;
  department: string;
  departmentCode?: string;
  eventId?: string;
  eventName: string;
  achievementTitle: string;
  photoUrl: string;
  photoPath?: string;
  monthYear: string;
  active: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/* =========================================================
   ANNOUNCEMENT
========================================================= */

export interface AnnouncementDocument {
  title: string;
  message: string;

  priority:
    | 'normal'
    | 'important'
    | 'urgent';

  published: boolean;

  publishFrom?: string;
  publishUntil?: string;

  createdBy: string;

  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/* =========================================================
   SETTINGS
========================================================= */

export interface SettingsDocument {
  siteName: string;
  collegeName: string;
  academicYear: string;

  clubLogoUrl?: string;
  collegeLogoUrl?: string;

  contactEmail?: string;
  contactPhone?: string;

  updatedAt: Timestamp | null;
  updatedBy: string;
}

/* =========================================================
   AUDIT LOG
========================================================= */

export interface AuditLogDocument {
  actorUid: string;
  actorRole: UserRole;

  action: string;
  collection: string;

  documentId?: string;
  details?: string;

  createdAt: Timestamp | null;
}

/* =========================================================
   COLLECTION NAMES
========================================================= */

export const COLLECTIONS = {
  departments: 'departments',

  events: 'events',

  registrations: 'registrations',

  registrationCounters:
    'registrationCounters',

  /*
   * Permanent Literature Club Member counters
   *
   * Example documents:
   * clubMemberCounters/PULSE
   * clubMemberCounters/GENOME
   * clubMemberCounters/CODEX
   */
  clubMemberCounters:
    'clubMemberCounters',

  users: 'users',

  coordinators: 'coordinators',

  coordinatorAssignments:
    'coordinatorAssignments',

  gallery: 'gallery',

  winners: 'winners',

  announcements: 'announcements',

  settings: 'settings',

  attendance: 'attendance',

  qrTokens: 'qrTokens',

  auditLogs: 'auditLogs',

  certificates: 'certificates',
} as const;
