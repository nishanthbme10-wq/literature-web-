# Phase 4 — Firebase Authentication & Role-Based Access

Implemented:
- Firebase email/password authentication for login and student registration.
- Firebase password reset email flow.
- Student accounts are created with role=student only.
- Coordinator applications are stored in `coordinatorRequests` without storing passwords.
- Signed-in user profile and role are resolved from Firestore by Firebase UID.
- Admin/coordinator/student role helpers remain in `src/lib/roles.ts`.
- App session state now follows Firebase Auth instead of trusting the old in-memory login API.
- Firestore rules prevent self-assignment of admin/coordinator roles.
- Coordinator request records are readable/modifiable only by admins after submission.

Important: an admin/coordinator account must be provisioned in Firebase Auth and its matching `users/{uid}` Firestore document must be created by an authorized admin/backend process.
