# Phase 13 — Content Management

Implemented on top of the Phase 12 project.

## Admin content controls
- Gallery: image upload to Firebase Storage, album/title/date, delete.
- Winners: student/department/event/achievement/month, optional photo upload, delete.
- Announcements: title/message/priority/publish window/published state, delete.
- Coordinators: profile, designation, department, role, academic year, bio, photo upload, delete.

## Storage
Public assets are stored under:
- `public/gallery/`
- `public/winners/`
- `public/coordinators/`

Firestore remains the metadata source of truth.

## Access
The Content Management panel is mounted inside the existing Admin Control Center and is intended for admin users. Firestore and Storage rules continue to enforce admin writes.

## Note
The existing public sections are intentionally preserved. A later final-polish pass can replace their legacy mock-data props with live Firestore subscriptions without removing the existing UI.
