# Phase 5 — Events Management

Implemented the first production Events Management layer using Firebase Firestore and Firebase Storage.

## Included
- Firestore-backed `events` collection
- Admin-only Events Manager
- Create / edit / close / delete events
- Event code normalization
- Date, start/end time, venue and registration deadline validation
- Maximum participant limit
- Eligible department selection from Firestore `departments`
- Draft / upcoming / open / closed / completed status
- Event rules
- Event poster upload to Firebase Storage
- Loading, empty, success and error states

## Files
- `src/services/events.ts`
- `src/components/EventsManager.tsx`

The older workshop system is intentionally retained for backwards compatibility. Student registration and registration-ID generation are deferred to later phases.
