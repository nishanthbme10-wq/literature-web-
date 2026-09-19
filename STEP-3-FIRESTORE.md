# Phase 3 — Firestore Database Architecture

Implemented a Firebase-first data model without removing the existing application features.

## Collections

- departments
- events
- registrations
- users
- coordinators
- coordinatorAssignments
- gallery
- winners
- announcements
- settings
- attendance
- auditLogs
- certificates

## New files

- `src/firebase/firestore-schema.ts` — typed document contracts and collection names
- `src/services/firestore.ts` — reusable Firestore CRUD/query service
- `firestore.indexes.json` — composite indexes for the planned public/admin queries

## Important design decisions

1. Firestore is the application source of truth for club data.
2. Registration IDs are intentionally NOT generated in this phase. That requires a transaction/counter strategy and will be implemented in the registration phase.
3. Department codes are stored as database fields, not derived only from frontend labels.
4. Coordinator-to-event access is represented by `coordinatorAssignments`.
5. Private student registration and attendance data remains separate from public CMS content.
6. Existing workshop/certificate/Google integrations are retained for later migration.
