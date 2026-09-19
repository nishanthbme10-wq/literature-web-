# Phase 15 — Final UI Polish & Deployment

## Completed

- Public website remains accessible without authentication.
- Removed the legacy hidden admin-login gateway and demo role switcher from the production UI.
- Admin/coordinator/student access continues through Firebase Authentication and Firestore role profiles.
- Updated browser title, metadata, theme color, favicon and mobile viewport settings.
- Added keyboard focus-visible styling and reduced-motion support.
- Added responsive/mobile polish utilities.
- Added Firebase Hosting configuration with SPA fallback and static-asset caching.
- Added `.firebaserc` for the configured Firebase project.
- Preserved existing Google Workspace, certificate, QR, registration and dashboard functionality.

## Production deployment

1. Install Node.js 20+ and Firebase CLI.
2. Run `npm install`.
3. Run `npm run lint` and fix any environment-specific errors.
4. Run `npm run build`.
5. Deploy Firestore rules and indexes:
   - `firebase deploy --only firestore:rules,firestore:indexes`
6. Deploy Storage rules:
   - `firebase deploy --only storage`
7. Deploy the frontend:
   - `firebase deploy --only hosting`

## Backend note

The project still contains the legacy Express/Drizzle surface used by existing features. Do not expose privileged server endpoints publicly without authentication middleware. For a fully serverless production deployment, migrate remaining privileged operations to Firebase Admin SDK-backed Cloud Functions/Cloud Run.

## Registration ID production gate

The client-side Firestore transaction implementation is concurrency-aware, but the strongest production design is to allocate registration serials inside a trusted backend (Cloud Functions/Cloud Run + Firebase Admin SDK). This prevents a malicious client from forging registration IDs while preserving the same `LC26-DEPARTMENT-EVENT-001` format.

## Firebase web configuration

Firebase web configuration is client configuration, not a private service-account credential. Never place Firebase Admin SDK private keys, service-account JSON files, OAuth client secrets, or API tokens in the repository or browser bundle.
