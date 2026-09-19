# Phase 10 — Backup Attendance Verification

Implemented two authorized fallback attendance methods alongside QR scanning:

1. Registration ID, for example `LC26-BME-POE-001`.
2. College Register Number + selected authorized Event.

Both methods use the same Firestore transaction used by QR attendance, so attendance cannot be marked twice. The stored `verificationMethod` is `registration_id` or `register_number` and the registration document is updated with `attendanceStatus`, `attendedAt`, `verifiedBy`, and `verificationMethod`.

Coordinator event access is limited by `coordinatorAssignments`; admins can verify across all events. The register-number path deliberately requires an event selection so a coordinator cannot perform a broad student-data search across unrelated events.
