# Phase 7 — Unique Registration ID

Registration IDs are now allocated with a Firestore transaction instead of a frontend-only counter.

## Format

`LC<YY>-<DEPARTMENT>-<EVENT>-<SERIAL>`

Examples:

- `LC26-BME-POE-001`
- `LC26-BME-POE-002`
- `LC26-CSE-POE-001`
- `LC26-BME-DEB-001`

## Serial scope

The serial counter resets independently for:

`Academic Year + Department Code + Event Code`

The counter documents live in `registrationCounters` and are not publicly readable.

## Concurrency

Student registration uses a Firestore transaction that atomically:

1. Reads the student's deterministic registration document.
2. Reads the department/event/year counter.
3. Allocates `lastSerial + 1`.
4. Writes the counter.
5. Writes the registration with the allocated ID.

If two students register at the same time, Firestore retries the transaction so each committed registration receives a different serial number.

The Firestore rules require the counter to advance by exactly one and require the registration and counter update to be committed together with `getAfter()`.

## Security note

This is database-transaction-safe and prevents duplicate serial allocation under concurrency. For a future hardened deployment, the allocation can be moved to a Firebase callable function using Firebase Admin SDK so students cannot intentionally advance counters and create gaps.
