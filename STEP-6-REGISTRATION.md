# Phase 6 — Student Event Registration

Implemented on the current Literature Club project.

## Delivered
- Firebase-backed student event registration UI.
- Active Firestore departments are used instead of free-text department entry.
- Student fields: full name, register number, email, phone, department, year, section, selected event.
- Registration is allowed only for open events before the deadline.
- Event department eligibility is checked.
- Deterministic `studentUid + eventId` document key prevents duplicate registrations for the same student/event.
- Students can view their own registrations and cancel an active registration.
- Registration data is private under Firestore rules.
- Existing workshop registration remains untouched.

## Phase 7 dependency
The registration record currently uses a temporary identifier such as `PENDING-POE-AB12CD34`.
Phase 7 will replace this with the transaction-safe `LC26-DEPARTMENT-EVENT-001` allocator and server-authoritative capacity enforcement.
