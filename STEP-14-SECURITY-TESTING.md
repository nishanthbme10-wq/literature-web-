# Phase 14 — Security & Testing

## Security hardening completed
- Student profiles cannot self-assign `admin` or `coordinator` roles.
- Student registration reads are private.
- Coordinator registration/attendance access is constrained by active event assignment.
- Registration writes require the authenticated student's UID and Firebase-auth email.
- Registration counters are not publicly readable and must advance by exactly one.
- Registration creation requires an existing event, an eligible department, and a matching counter serial.
- Student cancellation cannot change identity, event, department, email, or serial fields.
- Attendance writes require authorized staff and a permitted verification method.
- Audit logs cannot be updated/deleted by clients.
- Storage writes have file-size and content-type limits.
- Unknown Firestore/Storage paths are denied by default.
- Client validation helpers cover register numbers, department/event codes, and uploads.

## Manual security test matrix
| Test | Expected |
|---|---|
| Anonymous reads registrations | Denied |
| Student reads another student's registration | Denied |
| Student changes own role | Denied |
| Student writes another user's profile | Denied |
| Coordinator reads unassigned event registration | Denied |
| Coordinator marks attendance for unassigned event | Denied |
| Student creates admin profile | Denied |
| Student reads registration counter | Denied |
| Student deletes attendance | Denied |
| Client writes unknown Firestore collection | Denied |
| Oversized storage upload | Denied |
| Unsupported storage content type | Denied |
| Duplicate attendance | Blocked by transaction/application logic |
| Duplicate registration | Blocked by deterministic registration document + transaction |

## Production deployment gate
Before deployment, run Firebase Emulator Suite tests for the rules above and configure a trusted server-side registration allocator (Cloud Functions/Cloud Run using Firebase Admin SDK) if registration IDs must be authoritative against malicious clients. Client transactions provide concurrency safety for normal registrations, but Firestore rules alone cannot safely derive an arbitrary zero-padded registration string from a counter.
