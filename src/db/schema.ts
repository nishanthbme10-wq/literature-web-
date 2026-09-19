import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or custom ID
  fullName: text('full_name').notNull(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').default(''),
  department: text('department').default('CSE'),
  year: text('year').default('1st'),
  section: text('section').default('A'),
  role: text('role').notNull().default('student'), // 'admin' | 'coordinator' | 'student'
  status: text('status').notNull().default('active'), // 'active' | 'pending_approval'
  createdAt: timestamp('created_at').defaultNow()
});

// Pending Updates table for Coordinator edits needing Admin approval
export const pendingUpdates = pgTable('pending_updates', {
  id: serial('id').primaryKey(),
  entityType: text('entity_type').notNull(), // 'workshop' | 'winner' | 'gallery' | 'activity' | 'header' | 'about' | 'contact'
  entityId: text('entity_id'),
  actionType: text('action_type').notNull(), // 'create' | 'update' | 'delete'
  submittedByUid: text('submitted_by_uid').notNull(),
  submittedByName: text('submitted_by_name').notNull(),
  proposedData: jsonb('proposed_data').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  adminComment: text('admin_comment'),
  createdAt: timestamp('created_at').defaultNow()
});

// Header configuration table
export const headerConfigs = pgTable('header_configs', {
  id: serial('id').primaryKey(),
  siteName: text('site_name').notNull(),
  siteSubtitle: text('site_subtitle').notNull(),
  leftLogoUrl: text('left_logo_url').notNull(),
  rightLogoUrl: text('right_logo_url').notNull(),
  heroSlogan: text('hero_slogan').notNull(),
  heroSubtext: text('hero_subtext').notNull(),
  announcementText: text('announcement_text').notNull(),
  showAnnouncement: boolean('show_announcement').default(true),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Workshops table
export const workshops = pgTable('workshops', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  posterUrl: text('poster_url').default(''),
  dateTime: text('date_time').notNull(),
  venue: text('venue').notNull(),
  resourcePerson: text('resource_person').notNull(),
  description: text('description').notNull(),
  googleFormUrl: text('google_form_url').default(''),
  status: text('status').notNull().default('Open'), // 'Open' | 'Closed' | 'Completed'
  category: text('category').default('Workshop'),
  createdById: text('created_by_id').default('admin'),
  createdAt: timestamp('created_at').defaultNow()
});

// Contest Winners table
export const winners = pgTable('winners', {
  id: text('id').primaryKey(),
  photoUrl: text('photo_url').default(''),
  name: text('name').notNull(),
  department: text('department').notNull(),
  eventName: text('event_name').notNull(),
  achievementTitle: text('achievement_title').notNull(),
  monthYear: text('month_year').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Gallery Items table
export const galleryItems = pgTable('gallery_items', {
  id: text('id').primaryKey(),
  album: text('album').notNull(),
  imageUrl: text('image_url').notNull(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Monthly Activities table
export const monthlyActivities = pgTable('monthly_activities', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  category: text('category').notNull(),
  summary: text('summary').notNull(),
  imageUrl: text('image_url').default(''),
  isPreviousMonth: boolean('is_previous_month').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Attendance Records table
export const attendanceRecords = pgTable('attendance_records', {
  id: text('id').primaryKey(),
  workshopId: text('workshop_id').notNull(),
  workshopTitle: text('workshop_title').notNull(),
  studentId: text('student_id').notNull(),
  studentName: text('student_name').notNull(),
  department: text('department').notNull(),
  year: text('year').notNull(),
  section: text('section').notNull(),
  status: text('status').notNull().default('Present'),
  markedAt: text('marked_at').notNull()
});

// Feedback Submissions table
export const feedbackSubmissions = pgTable('feedback_submissions', {
  id: text('id').primaryKey(),
  workshopId: text('workshop_id').notNull(),
  workshopTitle: text('workshop_title').notNull(),
  studentId: text('student_id').notNull(),
  studentName: text('student_name').notNull(),
  rating: integer('rating').notNull(),
  comments: text('comments').default(''),
  submittedAt: text('submitted_at').notNull()
});

// Certificates table
export const certificates = pgTable('certificates', {
  id: text('id').primaryKey(),
  certificateCode: text('certificate_code').notNull().unique(),
  studentId: text('student_id').notNull(),
  studentName: text('student_name').notNull(),
  department: text('department').notNull(),
  workshopId: text('workshop_id').notNull(),
  workshopTitle: text('workshop_title').notNull(),
  issueDate: text('issue_date').notNull(),
  coordinatorSignatureName: text('coordinator_signature_name').default('VSB Literary Team'),
  pdfUrl: text('pdf_url'),
  emailSentStatus: boolean('email_sent_status').default(false)
});

// Activity Audit Logs table
export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  userRole: text('user_role').notNull(),
  userName: text('user_name').notNull(),
  action: text('action').notNull(),
  details: text('details').notNull()
});

// Editable Site Sections table (for About, Contact, Hero customizations)
export const siteSections = pgTable('site_sections', {
  sectionKey: text('section_key').primaryKey(), // 'about' | 'contact' | 'hero'
  content: jsonb('content').notNull(),
  updatedAt: timestamp('updated_at').defaultNow()
});
