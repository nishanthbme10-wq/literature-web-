# Phase 11 — Coordinator Dashboard

Implemented a Firebase-backed coordinator workspace without removing the existing dashboard.

## Features

- Assigned event loading for coordinators; admins can see all verification events.
- Event selector with date and venue context.
- Event registration list from Firestore.
- Search by registration ID, student name, register number, email, department.
- Department and attendance filters.
- Registration, present, pending-attendance and capacity statistics.
- CSV and Excel export for the selected event.
- QR attendance scanner access.
- Registration ID/register-number backup verification access.
- Empty, loading and error states.
- Responsive layout with mobile-safe table scrolling.

## Authorization

The UI is not the security boundary. Firestore rules must continue to restrict registration/attendance reads to admins and coordinators assigned to the event.
