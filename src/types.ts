/* =========================================================
   USER / ROLE
========================================================= */

export type UserRole =
  | 'admin'
  | 'coordinator'
  | 'student';

export const DEPARTMENTS = [
  'AI&DS',
  'MECH',
  'CSBS',
  'BT',
  'BME',
  'AI&ML',
  'CSE',
  'IT',
  'CCE',
  'ECE',
  'EEE',
  'CIVIL',
  'CHEMICAL',
] as const;

export type DepartmentName =
  typeof DEPARTMENTS[number];

/* =========================================================
   COORDINATOR REQUEST
========================================================= */

export interface CoordinatorRequest {
  id: string;

  fullName: string;

  department: string;

  year: string;

  email: string;

  phone: string;

  username: string;

  password?: string;

  reason: string;

  status:
    | 'Pending'
    | 'Approved'
    | 'Rejected';

  createdAt: string;
}

/* =========================================================
   USER
========================================================= */

export interface User {
  id: string;

  fullName: string;

  username: string;

  email: string;

  phone: string;

  department: string;

  year:
    | '1st'
    | '2nd'
    | '3rd'
    | '4th'
    | 'Faculty/Admin';

  section:
    | 'A'
    | 'B'
    | 'C'
    | 'D'
    | 'N/A';

  role: UserRole;

  clubMemberId?: string;

  avatarUrl?: string;

  createdBy?: string;

  password?: string;

  createdAt: string;
}

/* =========================================================
   HEADER CONFIG
========================================================= */

export interface HeaderConfig {
  siteName: string;

  siteSubtitle: string;

  leftLogoUrl: string;

  rightLogoUrl: string;

  heroSlogan: string;

  heroSubtext: string;

  announcementText: string;

  showAnnouncement: boolean;
}

/* =========================================================
   FOOTER CONFIG
========================================================= */

export interface FooterConfig {
  aboutText: string;

  contactNote: string;

  copyrightText: string;

  collegeTagline: string;
}

/* =========================================================
   WORKSHOP / EVENT
========================================================= */

export type WorkshopRegistrationType =
  | 'individual'
  | 'team';

export type WorkshopStatus =
  | 'Open'
  | 'Closed'
  | 'Completed';

export interface Workshop {
  id: string;

  /*
   * Public event title.
   */
  title: string;

  /*
   * Short unique code used later
   * for registration ID generation.
   *
   * Example:
   * POETRY
   * DEBATE
   * QUIZ
   */
  eventCode: string;

  /*
   * Event poster.
   */
  posterUrl: string;

  /*
   * Date and time shown on the website.
   */
  dateTime: string;

  /*
   * Event venue.
   */
  venue: string;

  /*
   * Resource person / speaker.
   */
  resourcePerson: string;

  /*
   * Event description.
   */
  description: string;

  /*
   * Google Form share URL.
   *
   * Student clicks Register Now
   * and this form opens.
   */
  googleFormUrl: string;

  /*
   * Registration status.
   */
  status: WorkshopStatus;

  /*
   * Category used by website filters.
   */
  category: string;

  /*
   * Individual or team registration.
   */
  registrationType?: WorkshopRegistrationType;

  /*
   * Used only for team registration.
   */
  teamMinSize?: number;

  teamMaxSize?: number;

  /*
   * Firebase / creator information.
   */
  createdById: string;
}

/* =========================================================
   WINNER
========================================================= */

export interface Winner {
  id: string;

  photoUrl: string;

  name: string;

  department: string;

  eventName: string;

  achievementTitle: string;

  monthYear: string;
}

/* =========================================================
   GALLERY
========================================================= */

export interface GalleryItem {
  id: string;

  album: string;

  imageUrl: string;

  title: string;

  date: string;
}

/* =========================================================
   ATTENDANCE
========================================================= */

export interface AttendanceRecord {
  id: string;

  workshopId: string;

  workshopTitle: string;

  studentId: string;

  studentName: string;

  department: string;

  year: string;

  section: string;

  status:
    | 'Present'
    | 'Absent';

  markedAt: string;
}

/* =========================================================
   FEEDBACK
========================================================= */

export interface FeedbackSubmission {
  id: string;

  workshopId: string;

  workshopTitle: string;

  studentId: string;

  studentName: string;

  rating: number;

  comments: string;

  submittedAt: string;
}

/* =========================================================
   CERTIFICATE
========================================================= */

export interface Certificate {
  id: string;

  certificateCode: string;

  studentId: string;

  studentName: string;

  department: string;

  workshopId: string;

  workshopTitle: string;

  issueDate: string;

  coordinatorSignatureName: string;

  pdfUrl?: string;

  emailSentStatus?: boolean;
}

/* =========================================================
   ACTIVITY LOG
========================================================= */

export interface ActivityLog {
  id: string;

  timestamp: string;

  userRole: UserRole;

  userName: string;

  action: string;

  details: string;
}

/* =========================================================
   INQUIRY
========================================================= */

export interface Inquiry {
  id: string;

  senderName: string;

  senderEmail: string;

  senderUid?: string;

  department: string;

  message: string;

  recipientType:
    | 'admin'
    | 'coordinator';

  recipientUid?: string;

  recipientDepartment?: string;

  createdAt: string;

  status:
    | 'unread'
    | 'read';

  archived: boolean;

  replyText?: string;

  repliedAt?: string;

  repliedBy?: string;
}

/* =========================================================
   DEPARTMENT INFO
========================================================= */

export interface DepartmentInfo {
  code: string;

  name: string;
}

export const DEPARTMENT_OPTIONS: DepartmentInfo[] = [
  {
    code: 'AI&DS',
    name: 'Artificial Intelligence & Data Science',
  },

  {
    code: 'MECH',
    name: 'Mechanical Engineering',
  },

  {
    code: 'CSBS',
    name: 'Computer Science & Business Systems',
  },

  {
    code: 'BT',
    name: 'Biotechnology',
  },

  {
    code: 'BME',
    name: 'Biomedical Engineering',
  },

  {
    code: 'AI&ML',
    name: 'Artificial Intelligence & Machine Learning',
  },

  {
    code: 'CSE',
    name: 'Computer Science & Engineering',
  },

  {
    code: 'IT',
    name: 'Information Technology',
  },

  {
    code: 'CCE',
    name: 'Computer & Communication Engineering',
  },

  {
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
  },

  {
    code: 'EEE',
    name: 'Electrical & Electronics Engineering',
  },

  {
    code: 'CIVIL',
    name: 'Civil Engineering',
  },

  {
    code: 'CHEMICAL',
    name: 'Chemical Engineering',
  },
];

/* =========================================================
   DEPARTMENT NORMALIZATION
========================================================= */

export function normalizeDepartment(
  deptStr?: string
): string {
  if (!deptStr) {
    return '';
  }

  const d =
    deptStr
      .trim()
      .toUpperCase();

  if (
    d === 'ADMIN' ||
    d.includes('ADMIN') ||
    d.includes('GENERAL')
  ) {
    return 'ADMIN';
  }

  if (
    d === 'BT' ||
    d.includes('BIOTECH')
  ) {
    return 'BT';
  }

  if (
    d === 'BME' ||
    d.includes('BIOMED')
  ) {
    return 'BME';
  }

  if (
    d === 'AI&DS' ||
    d === 'AIDS' ||
    (
      d.includes('DATA') &&
      d.includes('AI')
    )
  ) {
    return 'AI&DS';
  }

  if (
    d === 'AI&ML' ||
    d === 'AIML' ||
    (
      d.includes('MACHINE') &&
      d.includes('AI')
    )
  ) {
    return 'AI&ML';
  }

  if (
    d === 'CSBS' ||
    d.includes('BUSINESS')
  ) {
    return 'CSBS';
  }

  if (
    d === 'CSE' ||
    d.includes('COMPUTER SCIENCE')
  ) {
    return 'CSE';
  }

  if (
    d === 'IT' ||
    d.includes('INFORMATION TECH')
  ) {
    return 'IT';
  }

  if (
    d === 'CCE' ||
    d.includes('COMMUNICATION ENG')
  ) {
    return 'CCE';
  }

  if (
    d === 'ECE' ||
    d.includes('ELECTRONICS & COMM')
  ) {
    return 'ECE';
  }

  if (
    d === 'EEE' ||
    d.includes('ELECTRICAL')
  ) {
    return 'EEE';
  }

  if (
    d === 'MECH' ||
    d.includes('MECHANICAL')
  ) {
    return 'MECH';
  }

  if (
    d === 'CIVIL'
  ) {
    return 'CIVIL';
  }

  if (
    d === 'CHEMICAL' ||
    d.includes('CHEM')
  ) {
    return 'CHEMICAL';
  }

  return deptStr;
}

/* =========================================================
   MONTHLY ACTIVITY
========================================================= */

export interface MonthlyActivity {
  id: string;

  title: string;

  date: string;

  category: string;

  summary: string;

  imageUrl: string;

  isPreviousMonth?: boolean;
}