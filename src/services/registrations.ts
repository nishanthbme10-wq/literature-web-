import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import {
  auth,
  db,
  getCurrentUserProfile,
} from '../lib/firebase';

import {
  COLLECTIONS,
  type EventDocument,
  type RegistrationDocument,
} from '../firebase/firestore-schema';

/* =========================================================
   SECURE QR TOKEN
========================================================= */

function createSecureQrToken() {
  const bytes = new Uint8Array(32);

  crypto.getRandomValues(bytes);

  return Array.from(
    bytes,
    (byte) =>
      byte
        .toString(16)
        .padStart(2, '0')
  ).join('');
}

/* =========================================================
   INPUT TYPE
========================================================= */

export interface StudentRegistrationInput {
  fullName: string;
  registerNumber: string;
  email: string;
  phone: string;
  department: string;
  departmentCode: string;
  year: string;
  section: string;
  eventId: string;
}

/* =========================================================
   HELPERS
========================================================= */

function clean(value: string) {
  return value.trim();
}

function registrationDocId(
  studentUid: string,
  eventId: string
) {
  return `${studentUid}__${eventId}`.replace(
    /[^a-zA-Z0-9_-]/g,
    '_'
  );
}

/* =========================================================
   VALIDATION
========================================================= */

export function validateStudentRegistration(
  input: StudentRegistrationInput
) {
  const errors: string[] = [];

  if (!clean(input.fullName)) {
    errors.push('Full Name is required.');
  }

  if (!clean(input.registerNumber)) {
    errors.push(
      'Register Number is required.'
    );
  }

  if (
    !/^\S+@\S+\.\S+$/.test(
      clean(input.email)
    )
  ) {
    errors.push(
      'Enter a valid email address.'
    );
  }

  if (
    !/^[0-9+()\-\s]{7,20}$/.test(
      clean(input.phone)
    )
  ) {
    errors.push(
      'Enter a valid phone number.'
    );
  }

  if (!clean(input.departmentCode)) {
    errors.push(
      'Select a department.'
    );
  }

  if (!clean(input.year)) {
    errors.push(
      'Select your year.'
    );
  }

  if (!clean(input.section)) {
    errors.push(
      'Select your section.'
    );
  }

  if (!clean(input.eventId)) {
    errors.push(
      'Select an event.'
    );
  }

  return errors;
}

/* =========================================================
   EVENT REGISTRATION STATUS
========================================================= */

function isRegistrationOpen(
  event: EventDocument
) {
  if (
    event.registrationStatus !==
    'open'
  ) {
    return false;
  }

  if (
    event.registrationDeadline &&
    new Date(
      event.registrationDeadline
    ).getTime() < Date.now()
  ) {
    return false;
  }

  return true;
}

/* =========================================================
   GET ALL STUDENT REGISTRATIONS
========================================================= */

export async function getStudentRegistrations(
  studentUid = auth.currentUser?.uid
) {
  if (!studentUid) {
    return [];
  }

  const snapshot = await getDocs(
    query(
      collection(
        db,
        COLLECTIONS.registrations
      ),
      where(
        'studentUid',
        '==',
        studentUid
      )
    )
  );

  return snapshot.docs.map(
    (item) => ({
      id: item.id,
      ...item.data(),
    })
  ) as Array<
    RegistrationDocument & {
      id: string;
    }
  >;
}

/* =========================================================
   GET ONE STUDENT REGISTRATION
========================================================= */

export async function getStudentRegistration(
  eventId: string,
  studentUid = auth.currentUser?.uid
) {
  if (!studentUid) {
    return null;
  }

  const snapshot = await getDoc(
    doc(
      db,
      COLLECTIONS.registrations,
      registrationDocId(
        studentUid,
        eventId
      )
    )
  );

  return snapshot.exists()
    ? ({
        id: snapshot.id,
        ...snapshot.data(),
      } as RegistrationDocument & {
        id: string;
      })
    : null;
}

/* =========================================================
   REGISTER STUDENT FOR EVENT
========================================================= */

export async function registerStudentForEvent(
  input: StudentRegistrationInput
) {
  /* -------------------------------------------------------
     STEP 1
     Confirm Firebase Authentication user
  ------------------------------------------------------- */

  const studentUid =
    auth.currentUser?.uid;

  if (!studentUid) {
    throw new Error(
      'Please sign in before registering for an event.'
    );
  }

  /* -------------------------------------------------------
     STEP 2
     Validate registration input
  ------------------------------------------------------- */

  const errors =
    validateStudentRegistration(input);

  if (errors.length) {
    throw new Error(
      errors.join(' ')
    );
  }

  /* -------------------------------------------------------
     STEP 3
     Get the REAL Firestore student profile
     
     This is important because the permanent
     Literature Club Member ID is stored there.
  ------------------------------------------------------- */

  const studentProfile =
    await getCurrentUserProfile(
      studentUid
    );

  if (!studentProfile) {
    throw new Error(
      'Student profile not found. Please log in again.'
    );
  }

  /* -------------------------------------------------------
     STEP 4
     Require permanent Literature Club Member ID
  ------------------------------------------------------- */

  const clubMemberId =
    studentProfile.clubMemberId?.trim();

  if (!clubMemberId) {
    throw new Error(
      'Your permanent Literature Club Member ID has not been assigned yet. Please log out and sign in again.'
    );
  }

  /* -------------------------------------------------------
     STEP 5
     Load selected event
  ------------------------------------------------------- */

  const eventSnapshot =
    await getDoc(
      doc(
        db,
        COLLECTIONS.events,
        input.eventId
      )
    );

  if (!eventSnapshot.exists()) {
    throw new Error(
      'The selected event no longer exists.'
    );
  }

  const event =
    eventSnapshot.data() as EventDocument;

  /* -------------------------------------------------------
     STEP 6
     Check registration status
  ------------------------------------------------------- */

  if (!isRegistrationOpen(event)) {
    throw new Error(
      'Registration is currently closed for this event.'
    );
  }

  /* -------------------------------------------------------
     STEP 7
     Check department eligibility
  ------------------------------------------------------- */

  const normalizedDepartmentCode =
    clean(
      input.departmentCode
    ).toUpperCase();

  if (
    !event.eligibleDepartments.includes(
      normalizedDepartmentCode
    )
  ) {
    throw new Error(
      `Your department (${normalizedDepartmentCode}) is not eligible for this event.`
    );
  }

  /* -------------------------------------------------------
     STEP 8
     Registration document reference
  ------------------------------------------------------- */

  const registrationRef =
    doc(
      db,
      COLLECTIONS.registrations,
      registrationDocId(
        studentUid,
        input.eventId
      )
    );

  /* -------------------------------------------------------
     STEP 9
     Event-specific registration counter
     
     Example:
     LC26-BME-POETRY-001
  ------------------------------------------------------- */

  const normalizedEventCode =
    clean(
      event.code
    ).toUpperCase();

  const academicYear =
    String(
      new Date().getFullYear()
    ).slice(-2);

  const counterId =
    `${academicYear}_${normalizedDepartmentCode}_${normalizedEventCode}`;

  const counterRef =
    doc(
      db,
      COLLECTIONS.registrationCounters,
      counterId
    );

  /* -------------------------------------------------------
     STEP 10
     Atomic transaction
  ------------------------------------------------------- */

  const result =
    await runTransaction(
      db,
      async (transaction) => {
        const [
          registrationSnapshot,
          counterSnapshot,
        ] = await Promise.all([
          transaction.get(
            registrationRef
          ),
          transaction.get(
            counterRef
          ),
        ]);

        /* -------------------------------------------------
           Prevent duplicate active registration
        ------------------------------------------------- */

        if (
          registrationSnapshot.exists() &&
          registrationSnapshot.data()
            .registrationStatus !==
            'cancelled'
        ) {
          throw new Error(
            'You are already registered for this event.'
          );
        }

        /* -------------------------------------------------
           Generate event registration serial
        ------------------------------------------------- */

        const previousSerial =
          counterSnapshot.exists()
            ? Number(
                counterSnapshot.data()
                  .lastSerial || 0
              )
            : 0;

        const serial =
          previousSerial + 1;

        const registrationId =
          `LC${academicYear}-${normalizedDepartmentCode}-${normalizedEventCode}-${String(
            serial
          ).padStart(3, '0')}`;

        /* -------------------------------------------------
           Build registration document
        ------------------------------------------------- */

        const data: RegistrationDocument =
          {
            registrationId,

            studentUid,

            /*
             * Permanent Literature Club Member ID
             *
             * Example:
             * VSBLC-PULSE-0001
             */
            clubMemberId,

            studentName:
              clean(
                input.fullName
              ),

            registerNumber:
              clean(
                input.registerNumber
              ).toUpperCase(),

            email:
              clean(
                input.email
              ).toLowerCase(),

            phone:
              clean(
                input.phone
              ),

            department:
              clean(
                input.department
              ),

            departmentCode:
              normalizedDepartmentCode,

            year:
              clean(
                input.year
              ),

            section:
              clean(
                input.section
              ).toUpperCase(),

            eventId:
              input.eventId,

            eventName:
              event.name,

            eventCode:
              normalizedEventCode,

            academicYear,

            qrToken:
              createSecureQrToken(),

            registrationStatus:
              'registered',

            attendanceStatus:
              'not_marked',

            coordinatorVisible:
              true,

            registeredAt:
              serverTimestamp() as RegistrationDocument['registeredAt'],

            updatedAt:
              serverTimestamp() as RegistrationDocument['updatedAt'],
          };

        /* -------------------------------------------------
           Update event registration counter
        ------------------------------------------------- */

        transaction.set(
          counterRef,
          {
            academicYear,

            departmentCode:
              normalizedDepartmentCode,

            eventCode:
              normalizedEventCode,

            lastSerial:
              serial,

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        /* -------------------------------------------------
           Save registration
        ------------------------------------------------- */

        transaction.set(
          registrationRef,
          data,
          {
            merge: false,
          }
        );

        /* -------------------------------------------------
           Save QR token mapping
        ------------------------------------------------- */

        transaction.set(
          doc(
            db,
            COLLECTIONS.qrTokens,
            data.qrToken
          ),
          {
            registrationId:
              data.registrationId,

            registrationDocId:
              registrationRef.id,

            eventId:
              data.eventId,

            studentUid,

            /*
             * Permanent club identity
             * stored with QR mapping too.
             */
            clubMemberId,

            active: true,

            createdAt:
              serverTimestamp(),
          },
          {
            merge: false,
          }
        );

        return data;
      }
    );

  /* -------------------------------------------------------
     STEP 11
     Return saved registration
  ------------------------------------------------------- */

  return {
    id:
      registrationRef.id,

    ...result,
  };
}

/* =========================================================
   CANCEL STUDENT REGISTRATION
========================================================= */

export async function cancelStudentRegistration(
  eventId: string
) {
  const studentUid =
    auth.currentUser?.uid;

  if (!studentUid) {
    throw new Error(
      'Please sign in.'
    );
  }

  const registrationRef =
    doc(
      db,
      COLLECTIONS.registrations,
      registrationDocId(
        studentUid,
        eventId
      )
    );

  const snapshot =
    await getDoc(
      registrationRef
    );

  if (!snapshot.exists()) {
    throw new Error(
      'Registration not found.'
    );
  }

  await updateDoc(
    registrationRef,
    {
      registrationStatus:
        'cancelled',

      updatedAt:
        serverTimestamp(),
    }
  );
}