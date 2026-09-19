import { getApps, initializeApp } from 'firebase/app';

import {
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  initializeFirestore,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore';

import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';

import firebaseConfig from '../../firebase-applet-config.json';

import {
  isSafeUpload,
  sanitizeFileName,
} from '../utils/security';


/* =========================================================
   FIREBASE INITIALIZATION
========================================================= */

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];


/* =========================================================
   FIRESTORE
========================================================= */

let firestoreDb;

try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch {
  firestoreDb = getFirestore(app);
}


/* =========================================================
   FIREBASE SERVICES
========================================================= */

export const db = firestoreDb;

export const auth = getAuth(app);

export const storage = getStorage(app);


/* =========================================================
   GOOGLE AUTH PROVIDER
========================================================= */

export const googleProvider =
  new GoogleAuthProvider();


/*
 * Existing Google Workspace integrations.
 */

for (const scope of [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly',
]) {
  googleProvider.addScope(scope);
}


/* =========================================================
   ACCESS TOKEN CACHE
========================================================= */

let cachedAccessToken: string | null = null;


export const setCachedAccessToken = (
  token: string | null
) => {
  cachedAccessToken = token;
};


export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

export const initAuth = (
  onAuthSuccess?: (
    user: FirebaseUser,
    accessToken: string | null
  ) => void,

  onAuthFailure?: () => void,
) =>
  onAuthStateChanged(
    auth,
    (user) => {

      if (user) {

        onAuthSuccess?.(
          user,
          cachedAccessToken
        );

      } else {

        cachedAccessToken = null;

        onAuthFailure?.();

      }

    }
  );


/* =========================================================
   EMAIL + PASSWORD LOGIN
========================================================= */

export async function emailPasswordSignIn(
  email: string,
  password: string
): Promise<FirebaseUser> {

  const result =
    await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

  return result.user;
}


/* =========================================================
   USER PROFILE TYPE
========================================================= */

export interface UserProfile {

  uid: string;

  fullName: string;

  username?: string;

  email: string;

  role:
    | 'admin'
    | 'coordinator'
    | 'student';

  phone?: string;

  department?: string;

  departmentCode?: string;

  year?: string;

  section?: string;

  clubMemberId?: string;

  photoURL?: string;

  createdAt?: Timestamp | null | string | Date;
  updatedAt?: Timestamp | null | string | Date;

  active: boolean;

}


/* =========================================================
   DEPARTMENT SIGNATURES
========================================================= */

const DEPARTMENT_SIGNATURES: Record<string, string> = {
  BME: 'PULSE',
  'BIOMEDICAL ENGINEERING': 'PULSE',

  BT: 'GENOME',
  BIOTECHNOLOGY: 'GENOME',

  CSE: 'CODEX',
  'COMPUTER SCIENCE AND ENGINEERING': 'CODEX',

  ECE: 'SIGNAL',
  'ELECTRONICS AND COMMUNICATION ENGINEERING': 'SIGNAL',

  EEE: 'VOLT',
  'ELECTRICAL AND ELECTRONICS ENGINEERING': 'VOLT',

  MECH: 'FORGE',
  MECHANICAL: 'FORGE',
  'MECHANICAL ENGINEERING': 'FORGE',

  CIVIL: 'STRUCTA',
  'CIVIL ENGINEERING': 'STRUCTA',

  AIDS: 'INSIGHT',
  'AI&DS': 'INSIGHT',
  'AI & DS': 'INSIGHT',
  'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE': 'INSIGHT',

  AIML: 'NEURA',
  'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING': 'NEURA',

  CCE: 'LINK',
  'COMPUTER AND COMMUNICATION ENGINEERING': 'LINK',

  CHEMICAL: 'CATALYST',
  CHEMICALS: 'CATALYST',
  'CHEMICAL ENGINEERING': 'CATALYST',

  CSBS: 'NEXUS',
  'COMPUTER SCIENCE AND BUSINESS SYSTEMS': 'NEXUS',

  IT: 'BYTE',
  'INFORMATION TECHNOLOGY': 'BYTE',
};


function getDepartmentSignature(department: string): string {
  const normalized = department.trim().toUpperCase();
  return DEPARTMENT_SIGNATURES[normalized] || 'MEMBER';
}


/* =========================================================
   GENERATE PERMANENT LITERATURE CLUB MEMBER ID
========================================================= */

export async function generatePermanentClubMemberId(
  department: string
): Promise<string> {
  const normalizedDepartment = department.trim().toUpperCase();

  if (!normalizedDepartment) {
    throw new Error(
      'Department is required to generate the Literature Club Member ID.'
    );
  }

  const signature = getDepartmentSignature(normalizedDepartment);

  const counterRef = doc(
    db,
    'clubMemberCounters',
    signature
  );

  return runTransaction(db, async (transaction) => {
    const counterSnapshot = await transaction.get(counterRef);

    const lastNumber = counterSnapshot.exists()
      ? Number(counterSnapshot.data().lastNumber || 0)
      : 0;

    const nextNumber = lastNumber + 1;
    const serial = String(nextNumber).padStart(4, '0');

    const permanentId =
      `VSBLC-${signature}-${serial}`;

    transaction.set(
      counterRef,
      {
        department: normalizedDepartment,
        signature,
        lastNumber: nextNumber,
        createdAt: counterSnapshot.exists()
          ? counterSnapshot.data().createdAt || serverTimestamp()
          : serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return permanentId;
  });
}


/* =========================================================
   ENSURE EXISTING STUDENT HAS A PERMANENT MEMBER ID
========================================================= */

export async function ensurePermanentClubMemberId(
  uid: string
): Promise<string | null> {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const existingData = snapshot.data();

  if (existingData.role !== 'student') {
    return existingData.clubMemberId
      ? String(existingData.clubMemberId)
      : null;
  }

  if (existingData.clubMemberId) {
    return String(existingData.clubMemberId);
  }

  const department =
    existingData.departmentCode ||
    existingData.department ||
    '';

  if (!department) {
    return null;
  }

  const normalizedDepartment = String(department)
    .trim()
    .toUpperCase();

  const signature = getDepartmentSignature(normalizedDepartment);

  const counterRef = doc(
    db,
    'clubMemberCounters',
    signature
  );

  return runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);

    if (!userSnapshot.exists()) {
      throw new Error('Student profile not found.');
    }

    const latestData = userSnapshot.data();

    if (latestData.clubMemberId) {
      return String(latestData.clubMemberId);
    }

    const counterSnapshot = await transaction.get(counterRef);

    const lastNumber = counterSnapshot.exists()
      ? Number(counterSnapshot.data().lastNumber || 0)
      : 0;

    const nextNumber = lastNumber + 1;
    const permanentId =
      `VSBLC-${signature}-${String(nextNumber).padStart(4, '0')}`;

    transaction.set(
      counterRef,
      {
        department: normalizedDepartment,
        signature,
        lastNumber: nextNumber,
        createdAt: counterSnapshot.exists()
          ? counterSnapshot.data().createdAt || serverTimestamp()
          : serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    transaction.set(
      userRef,
      {
        clubMemberId: permanentId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return permanentId;
  });
}


/* =========================================================
   GET CURRENT USER PROFILE
========================================================= */

export async function getCurrentUserProfile(
  uid = auth.currentUser?.uid
): Promise<UserProfile | null> {
  if (!uid) {
    return null;
  }

  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  let data = snapshot.data() as Omit<UserProfile, 'uid'>;

  if (data.role === 'student' && !data.clubMemberId) {
    try {
      const generatedId =
        await ensurePermanentClubMemberId(uid);

      if (generatedId) {
        data = {
          ...data,
          clubMemberId: generatedId,
        };
      }
    } catch (error) {
      console.warn(
        'Unable to assign Literature Club Member ID during profile load:',
        error
      );
    }
  }

  return {
    uid,
    ...data,
  } as UserProfile;
}


/* =========================================================
   ENSURE STUDENT PROFILE
========================================================= */

/*
 * IMPORTANT:
 *
 * This function NEVER changes an existing
 * admin/coordinator role into student.
 *
 * If the user already exists,
 * existing Firestore data is returned.
 */

export async function ensureStudentProfile(
  user: FirebaseUser
): Promise<UserProfile> {

  const userRef =
    doc(db, 'users', user.uid);


  const existing =
    await getDoc(userRef);


  /*
   * Existing user
   */

  if (existing.exists()) {

    return {
      uid: user.uid,
      ...existing.data(),
    } as UserProfile;

  }


  /*
   * First-time student profile.
   */

  const profile = {

    uid: user.uid,

    fullName:
      user.displayName ?? '',

    email:
      user.email ?? '',

    role: 'student' as const,

    photoURL:
      user.photoURL ?? '',

    active: true,

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),

  };


  await setDoc(
    userRef,
    profile
  );


  return {

    uid: user.uid,

    fullName: profile.fullName,

    email: profile.email,

    role: 'student',

    photoURL: profile.photoURL,

    active: true,

  };

}


/* =========================================================
   STUDENT REGISTRATION
========================================================= */

/*
 * Student registration flow:
 *
 * 1. Firebase Authentication account
 *
 * 2. users/{uid} Firestore document
 *
 * 3. Real student details stored
 *
 * 4. role automatically = student
 *
 * 5. active automatically = true
 *
 * 6. Password is NEVER stored in Firestore
 */

export async function registerStudentAccount(
  input: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    phone: string;
    department: string;
    year: string;
    section: string;
    avatarUrl?: string;
  }
) {
  /* -------------------------------------------------------
     STEP 1: CREATE AUTH ACCOUNT
  ------------------------------------------------------- */

  const result = await createUserWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password
  );

  const firebaseUser = result.user;

  /* -------------------------------------------------------
     STEP 2: GENERATE PERMANENT MEMBER ID FIRST

     This is done before the profile is returned, so the
     dashboard receives the Member ID immediately without
     requiring refresh.
  ------------------------------------------------------- */

  let clubMemberId: string;

  try {
    clubMemberId =
      await generatePermanentClubMemberId(
        input.department
      );
  } catch (error) {
    /*
     * Auth account already exists at this point. If Member ID
     * allocation fails, cleanly stop the registration flow so
     * the caller does not receive a misleading success state.
     */
    try {
      await signOut(auth);
    } catch {
      // Ignore secondary sign-out failure.
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : 'Unable to generate Literature Club Member ID.'
    );
  }

  /* -------------------------------------------------------
     STEP 3: CREATE FIRESTORE STUDENT PROFILE
  ------------------------------------------------------- */

  const userRef = doc(
    db,
    'users',
    firebaseUser.uid
  );

  const studentProfile = {
    uid: firebaseUser.uid,

    fullName: input.fullName.trim(),

    username: input.username.trim(),

    email: firebaseUser.email ?? input.email.trim(),

    phone: input.phone.trim(),

    department: input.department,

    year: input.year,

    section: input.section,

    role: 'student' as const,

    clubMemberId,

    active: true,

    photoURL: input.avatarUrl ?? '',

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  };

  await setDoc(
    userRef,
    studentProfile,
    { merge: true }
  );

  /* -------------------------------------------------------
     STEP 4: RETURN COMPLETE PROFILE IMMEDIATELY
  ------------------------------------------------------- */

  const profile: UserProfile = {
    uid: firebaseUser.uid,

    fullName: input.fullName.trim(),

    username: input.username.trim(),

    email: firebaseUser.email ?? input.email.trim(),

    role: 'student',

    phone: input.phone.trim(),

    department: input.department,

    year: input.year,

    section: input.section,

    clubMemberId,

    photoURL: input.avatarUrl ?? '',

    active: true,
  };

  return {
    user: firebaseUser,
    profile,
  };
}


/* =========================================================
   COORDINATOR ACCESS REQUEST
========================================================= */

export async function requestCoordinatorAccess(
  input: {

    fullName: string;

    department: string;

    year: string;

    email: string;

    phone: string;

    username: string;

    reason: string;

  }
) {

  const requestRef =
    await addDoc(
      collection(
        db,
        'coordinatorRequests'
      ),
      {

        fullName:
          input.fullName.trim(),

        department:
          input.department,

        year:
          input.year,

        email:
          input.email.trim(),

        phone:
          input.phone.trim(),

        username:
          input.username.trim(),

        reason:
          input.reason.trim(),

        status:
          'Pending',

        createdAt:
          serverTimestamp(),

      }
    );


  return requestRef.id;

}


/* =========================================================
   PASSWORD RESET
========================================================= */

export async function requestPasswordReset(
  email: string
) {

  await sendPasswordResetEmail(
    auth,
    email.trim()
  );

}


/* =========================================================
   GOOGLE SIGN IN
========================================================= */

export const googleSignIn =
  async (): Promise<{
    user: FirebaseUser;
    accessToken: string | null;
  }> => {

    const result =
      await signInWithPopup(
        auth,
        googleProvider
      );


    const credential =
      GoogleAuthProvider
        .credentialFromResult(
          result
        );


    cachedAccessToken =
      credential?.accessToken ??
      null;


    return {

      user:
        result.user,

      accessToken:
        cachedAccessToken,

    };

  };


/* =========================================================
   LOGOUT
========================================================= */

export const logoutUser =
  async () => {

    await signOut(auth);

    cachedAccessToken =
      null;

  };


/* =========================================================
   FIRESTORE ERROR TYPES
========================================================= */

export enum OperationType {

  CREATE = 'create',

  UPDATE = 'update',

  DELETE = 'delete',

  LIST = 'list',

  GET = 'get',

  WRITE = 'write',

}


export interface FirestoreErrorInfo {

  error: string;

  operationType:
    OperationType;

  path:
    string | null;

  authInfo: {

    userId?:
      string | null;

    email?:
      string | null;

    emailVerified?:
      boolean | null;

    isAnonymous?:
      boolean | null;

  };

}


/* =========================================================
   FIRESTORE ERROR HANDLER
========================================================= */

export function handleFirestoreError(
  error: unknown,

  operationType:
    OperationType,

  path:
    string | null
) {

  const errInfo:
    FirestoreErrorInfo = {

    error:
      error instanceof Error
        ? error.message
        : String(error),

    authInfo: {

      userId:
        auth.currentUser?.uid,

      email:
        auth.currentUser?.email,

      emailVerified:
        auth.currentUser?.emailVerified,

      isAnonymous:
        auth.currentUser?.isAnonymous,

    },

    operationType,

    path,

  };


  console.error(
    'Firestore Error:',
    JSON.stringify(errInfo)
  );


  throw new Error(
    JSON.stringify(errInfo)
  );

}


/* =========================================================
   REAL-TIME USER PROFILE LISTENER
========================================================= */

export function subscribeToUserProfile(
  uid: string,

  onChange:
    (profile: UserProfile | null) => void,

  onError?:
    (error: Error) => void,
) {

  return onSnapshot(

    doc(
      db,
      'users',
      uid
    ),

    (snapshot) => {

      if (
        snapshot.exists()
      ) {

        onChange({

          uid,

          ...snapshot.data(),

        } as UserProfile);

      } else {

        onChange(null);

      }

    },

    (error) => {

      onError?.(error);

    }

  );

}


/* =========================================================
   LIVE STUDENT PROFILE LISTENER
========================================================= */

export function subscribeToStudentProfiles(
  onChange: (profiles: UserProfile[]) => void,
  onError?: (error: Error) => void
) {
  const studentsQuery = query(
    collection(
      db,
      'users'
    ),
    where(
      'role',
      '==',
      'student'
    )
  );

  return onSnapshot(
    studentsQuery,

    (snapshot) => {
      const profiles = snapshot.docs.map(
        (item) => ({
          uid: item.id,
          ...item.data(),
        } as UserProfile)
      );

      onChange(profiles);
    },

    (error) => {
      console.error(
        'Unable to load registered student profiles:',
        error
      );

      onError?.(error);
    }
  );
}


/* =========================================================
   COORDINATOR ASSIGNMENTS
========================================================= */

export async function getCoordinatorAssignments(
  uid: string
) {

  const snapshot =
    await getDocs(

      query(

        collection(
          db,
          'coordinatorAssignments'
        ),

        where(
          'coordinatorUid',
          '==',
          uid
        )

      )

    );


  return snapshot.docs.map(
    (item) => ({

      id:
        item.id,

      ...item.data(),

    })
  );

}


/* =========================================================
   FILE / IMAGE UPLOAD
========================================================= */

export async function uploadClubAsset(
  file: File,

  folder: string,

  fileName?: string
) {

  /*
   * Security validation.
   */

  if (
    !isSafeUpload(file)
  ) {

    throw new Error(
      'Unsupported file type or file is larger than 10 MB.'
    );

  }


  /*
   * Safe filename.
   */

  const safeName =
    fileName
      ? sanitizeFileName(fileName)
      : `${Date.now()}-${sanitizeFileName(file.name)}`;


  /*
   * Storage path.
   */

  const storageRef =
    ref(
      storage,
      `${folder}/${safeName}`
    );


  /*
   * Upload.
   */

  await uploadBytes(
    storageRef,
    file,
    {
      contentType:
        file.type || undefined,
    }
  );


  /*
   * Download URL.
   */

  return getDownloadURL(
    storageRef
  );

}


/* =========================================================
   DELETE STORAGE FILE
========================================================= */

export async function deleteClubAsset(
  storagePath: string
) {

  await deleteObject(
    ref(
      storage,
      storagePath
    )
  );

}


/* =========================================================
   FIRESTORE CONNECTION TEST
========================================================= */

export async function testFirestoreConnection() {

  if (
    typeof window !== 'undefined' &&
    !navigator.onLine
  ) {

    return;

  }


  try {

    await getDoc(
      doc(
        db,
        '_connection_test',
        'status'
      )
    );

  } catch {

    /*
     * Startup should not fail just because
     * Firestore is temporarily unavailable.
     */

  }

}


/* =========================================================
   GENERIC FIRESTORE RECORD
========================================================= */

export type FirestoreRecord =
  DocumentData & {
    id: string;
  };