# Phase 12 — Admin Dashboard

Implemented the production-style Admin Control Center on top of the existing dashboard.

## Features
- Live Firestore overview metrics
- Total/active events, registrations, students and attendance
- Department-wise registration analytics
- Event-wise registration analytics
- Registration search and filters
- Registration CSV export
- Coordinator-to-event assignment management
- Assignment deactivation
- Department configuration view
- Admin-only access to the new control center

## Files
- `src/components/AdminControlCenter.tsx`
- `src/components/AdminCoordinatorDashboard.tsx` (integrated tab)

## Verification
TypeScript was checked with the system `tsc`. The repository currently lacks installed npm dependencies, so dependency-resolution errors are expected; no clean production build is claimed.
