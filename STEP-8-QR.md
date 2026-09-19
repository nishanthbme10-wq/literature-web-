# Phase 8 — QR Code Generation

Implemented on the single current project.

## Included
- Secure 32-byte browser cryptographic QR token generated at registration time.
- Token is stored in the registration document and is not exposed as a separate public search endpoint.
- QR payload contains version, portal type, registration ID, and secure token.
- Student receives an immediate registration confirmation card after successful registration.
- QR code is rendered locally using the `qrcode` package; no student data is sent to an external QR service.
- Download QR as PNG.
- Registration ID and QR token remain associated with the Firebase registration record.

## Next phase
Phase 9 will add authorized QR scanning and attendance verification. The scanner will validate the registration token against Firestore and will never allow a public user to search private registration records.
