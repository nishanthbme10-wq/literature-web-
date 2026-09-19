# Phase 9 — QR Attendance

Implemented QR attendance verification for authorized admin/coordinator users.

## Flow

1. Coordinator/admin opens Dashboard → QR Check-in.
2. Camera scans the registration QR generated in Phase 8.
3. The QR payload is parsed and the registration is verified by registration document ID + secure QR token (with a Firestore `qrTokens` index for assignment-scoped lookup).
4. Firestore transaction checks the registration is active and not already marked present.
5. Attendance document is created/updated with `verificationMethod: qr` and `verifiedBy`.
6. Registration is updated with `attendanceStatus: present`, `attendedAt`, and verification metadata.

## Security

- Students cannot write attendance.
- Coordinators are limited to events assigned through `coordinatorAssignments/{coordinatorUid}_{eventId}` with `active == true`.
- Registration reads for coordinators are also assignment-scoped.
- Re-scanning an already-present registration does not create a duplicate attendance record.

## Dependency

`@zxing/browser` is used for camera QR decoding. Browsers must grant camera permission and the deployed site should use HTTPS (localhost is also supported for development).

## Important

The existing legacy attendance upload UI remains intact for backward compatibility. Phase 10 will add Registration ID and Register Number backup verification using the same authorization model.
