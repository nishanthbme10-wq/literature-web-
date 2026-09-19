# Phase 2 — Firebase Foundation

Implemented without replacing the existing application architecture.

## Added

- Central Firebase Auth, Firestore and Storage initialization in `src/lib/firebase.ts`.
- `getCurrentUserProfile()` for role/profile lookup.
- `ensureStudentProfile()` for safe first-login student provisioning.
- `subscribeToUserProfile()` for live role/profile changes.
- `getCoordinatorAssignments()` foundation for event-scoped coordinator access.
- `uploadClubAsset()` and `deleteClubAsset()` for Firebase Storage.
- `src/lib/roles.ts` role/permission helpers.
- `storage.rules` with public/private asset boundaries.

## Security changes

`firestore.rules` now distinguishes:

- `admin`
- `coordinator`
- `student`

Public CMS content remains readable publicly, while management writes require an admin. Student profiles cannot self-promote to admin/coordinator.

## Important migration note

The existing `App.tsx` and legacy Express API are intentionally still in place in this phase. They will be migrated feature-by-feature in the next phases rather than being removed abruptly.

Admin/coordinator accounts must be provisioned by an authorized administrative/backend process. A browser user can only self-create a `student` profile.
