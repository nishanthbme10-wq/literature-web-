import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint
} from 'firebase/firestore';

import { COLLECTIONS } from '../firebase/firestore-schema';
import { db } from '../lib/firebase';

export type FirestoreEntity<T> = T & {
  id: string;
};

/* =========================================================
   BASIC FIRESTORE FUNCTIONS
========================================================= */

export async function getDocument<T extends DocumentData>(
  collectionName: string,
  id: string
) {
  const snapshot = await getDoc(
    doc(db, collectionName, id)
  );

  return snapshot.exists()
    ? ({
        id: snapshot.id,
        ...snapshot.data(),
      } as FirestoreEntity<T>)
    : null;
}

export async function listDocuments<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const reference = collection(db, collectionName);

  const firestoreQuery =
    constraints.length > 0
      ? query(reference, ...constraints)
      : query(reference);

  const snapshot = await getDocs(firestoreQuery);

  return snapshot.docs.map(
    (item) =>
      ({
        id: item.id,
        ...item.data(),
      }) as FirestoreEntity<T>
  );
}

export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: T
) {
  const reference = await addDoc(
    collection(db, collectionName),
    data
  );

  return reference.id;
}

export async function setDocument<T extends DocumentData>(
  collectionName: string,
  id: string,
  data: T,
  merge = false
) {
  await setDoc(
    doc(db, collectionName, id),
    data,
    { merge }
  );
}

export async function updateDocument(
  collectionName: string,
  id: string,
  data: Partial<DocumentData>
) {
  await updateDoc(
    doc(db, collectionName, id),
    data
  );
}

export async function deleteDocument(
  collectionName: string,
  id: string
) {
  await deleteDoc(
    doc(db, collectionName, id)
  );
}

/* =========================================================
   SORT HELPER
   Supports:
   - strings
   - numbers
   - Firebase Timestamp
   - Date
========================================================= */

function getSortableValue(value: unknown): number | string {
  if (value === null || value === undefined) {
    return '';
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toMillis' in value &&
    typeof (value as { toMillis?: unknown }).toMillis === 'function'
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const time = Date.parse(value);

    if (!Number.isNaN(time)) {
      return time;
    }

    return value.toLowerCase();
  }

  return String(value).toLowerCase();
}

/* =========================================================
   DEPARTMENTS

   IMPORTANT:
   We only use "where".
   Sorting is done in JavaScript.

   This avoids the composite index requirement.
========================================================= */

export const getDepartments = async () => {
  const data = await listDocuments(
    COLLECTIONS.departments,
    [
      where('active', '==', true),
    ]
  );

  return data.sort((a, b) => {
    const aValue = Number(
      (a as DocumentData).sortOrder ?? 999999
    );

    const bValue = Number(
      (b as DocumentData).sortOrder ?? 999999
    );

    return aValue - bValue;
  });
};

/* =========================================================
   OPEN EVENTS

   IMPORTANT:
   No orderBy here.

   Firebase only performs the simple "where" query.
   We sort the events locally.
========================================================= */

export const getOpenEvents = async () => {
  const data = await listDocuments(
    COLLECTIONS.events,
    [
      where(
        'registrationStatus',
        '==',
        'open'
      ),
    ]
  );

  return data.sort((a, b) => {
    const aDate = getSortableValue(
      (a as DocumentData).date
    );

    const bDate = getSortableValue(
      (b as DocumentData).date
    );

    if (
      typeof aDate === 'number' &&
      typeof bDate === 'number'
    ) {
      return aDate - bDate;
    }

    return String(aDate).localeCompare(
      String(bDate)
    );
  });
};

/* =========================================================
   ANNOUNCEMENTS

   No composite index.
========================================================= */

export const getPublishedAnnouncements = async () => {
  const data = await listDocuments(
    COLLECTIONS.announcements,
    [
      where(
        'published',
        '==',
        true
      ),
    ]
  );

  const sorted = data.sort((a, b) => {
    const aDate = getSortableValue(
      (a as DocumentData).createdAt
    );

    const bDate = getSortableValue(
      (b as DocumentData).createdAt
    );

    if (
      typeof aDate === 'number' &&
      typeof bDate === 'number'
    ) {
      return bDate - aDate;
    }

    return String(bDate).localeCompare(
      String(aDate)
    );
  });

  return sorted.slice(0, 10);
};

/* =========================================================
   GALLERY

   No composite index.
========================================================= */

export const getActiveGallery = async () => {
  const data = await listDocuments(
    COLLECTIONS.gallery,
    [
      where(
        'active',
        '==',
        true
      ),
    ]
  );

  return data.sort((a, b) => {
    const aDate = getSortableValue(
      (a as DocumentData).date
    );

    const bDate = getSortableValue(
      (b as DocumentData).date
    );

    if (
      typeof aDate === 'number' &&
      typeof bDate === 'number'
    ) {
      return bDate - aDate;
    }

    return String(bDate).localeCompare(
      String(aDate)
    );
  });
};

/* =========================================================
   WINNERS

   No composite index.
========================================================= */

export const getActiveWinners = async () => {
  const data = await listDocuments(
    COLLECTIONS.winners,
    [
      where(
        'active',
        '==',
        true
      ),
    ]
  );

  return data.sort((a, b) => {
    const aDate = getSortableValue(
      (a as DocumentData).createdAt
    );

    const bDate = getSortableValue(
      (b as DocumentData).createdAt
    );

    if (
      typeof aDate === 'number' &&
      typeof bDate === 'number'
    ) {
      return bDate - aDate;
    }

    return String(bDate).localeCompare(
      String(aDate)
    );
  });
};

/* =========================================================
   EXPORT
========================================================= */

export { COLLECTIONS };
