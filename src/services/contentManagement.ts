import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { COLLECTIONS } from '../firebase/firestore-schema';

import { db } from '../lib/firebase';

/* =========================================================
   LIST CONTENT
========================================================= */

export async function listContent(
  collectionName: string
) {
  const snap = await getDocs(
    query(
      collection(
        db,
        collectionName
      ),
      orderBy(
        'createdAt',
        'desc'
      )
    )
  );

  return snap.docs.map(
    (d) => ({
      id: d.id,
      ...d.data(),
    })
  );
}

/* =========================================================
   GALLERY
   PAYMENT-FREE
   IMAGE URL ONLY
========================================================= */

export async function createGallery(
  input: {
    title: string;
    album: string;
    date: string;
    imageUrl: string;
    adminUid: string;
  }
) {
  const imageUrl =
    input.imageUrl.trim();

  const ref =
    await addDoc(
      collection(
        db,
        COLLECTIONS.gallery
      ),
      {
        title:
          input.title.trim(),

        album:
          input.album.trim(),

        date:
          input.date,

        imageUrl,

        imagePath: '',

        active: true,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),

        createdBy:
          input.adminUid,
      }
    );

  return {
    id: ref.id,
    imageUrl,
  };
}

export async function removeGallery(
  id: string
) {
  await deleteDoc(
    doc(
      db,
      COLLECTIONS.gallery,
      id
    )
  );
}

/* =========================================================
   WINNERS
   PAYMENT-FREE
   PHOTO URL ONLY
========================================================= */

export async function createWinner(
  input: {
    name: string;
    department: string;
    departmentCode: string;
    eventName: string;
    eventId?: string;
    achievementTitle: string;
    monthYear: string;
    photoUrl?: string;
    adminUid: string;
  }
) {
  const photoUrl =
    input.photoUrl?.trim() ||
    '';

  const ref =
    await addDoc(
      collection(
        db,
        COLLECTIONS.winners
      ),
      {
        name:
          input.name.trim(),

        department:
          input.department.trim(),

        departmentCode:
          input.departmentCode,

        eventName:
          input.eventName.trim(),

        eventId:
          input.eventId || '',

        achievementTitle:
          input.achievementTitle.trim(),

        monthYear:
          input.monthYear.trim(),

        photoUrl,

        photoPath: '',

        active: true,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),

        createdBy:
          input.adminUid,
      }
    );

  return ref.id;
}

export async function removeWinner(
  id: string
) {
  await deleteDoc(
    doc(
      db,
      COLLECTIONS.winners,
      id
    )
  );
}

/* =========================================================
   ANNOUNCEMENTS
========================================================= */

export async function saveAnnouncement(
  input: {
    id?: string;
    title: string;
    message: string;
    priority:
      | 'normal'
      | 'important'
      | 'urgent';
    published: boolean;
    publishFrom?: string;
    publishUntil?: string;
    adminUid: string;
  }
) {
  const payload = {
    title:
      input.title.trim(),

    message:
      input.message.trim(),

    priority:
      input.priority,

    published:
      input.published,

    publishFrom:
      input.publishFrom ||
      '',

    publishUntil:
      input.publishUntil ||
      '',

    createdBy:
      input.adminUid,

    updatedAt:
      serverTimestamp(),
  };

  if (input.id) {
    await setDoc(
      doc(
        db,
        COLLECTIONS.announcements,
        input.id
      ),
      payload,
      {
        merge: true,
      }
    );

    return input.id;
  }

  const ref =
    await addDoc(
      collection(
        db,
        COLLECTIONS.announcements
      ),
      {
        ...payload,

        createdAt:
          serverTimestamp(),
      }
    );

  return ref.id;
}

export async function removeAnnouncement(
  id: string
) {
  await deleteDoc(
    doc(
      db,
      COLLECTIONS.announcements,
      id
    )
  );
}

/* =========================================================
   COORDINATORS
   PAYMENT-FREE
   PHOTO URL ONLY
========================================================= */

export async function saveCoordinator(
  input: {
    id?: string;
    userId: string;
    name: string;
    designation: string;
    department: string;
    departmentCode: string;
    role: string;
    academicYear: string;
    bio: string;
    photoUrl?: string;
    adminUid: string;
  }
) {
  const coordinatorUid =
    input.userId.trim();

  if (!coordinatorUid) {
    throw new Error(
      'Firebase User UID is required.'
    );
  }

  const photoUrl =
    input.photoUrl?.trim() || '';

  const payload = {
    userId: coordinatorUid,

    name: input.name.trim(),

    designation:
      input.designation.trim(),

    department:
      input.department.trim(),

    departmentCode:
      input.departmentCode.trim(),

    role:
      input.role.trim() || 'Coordinator',

    academicYear:
      input.academicYear.trim(),

    bio:
      input.bio.trim(),

    photoUrl,

    photoPath: '',

    active: true,

    updatedAt:
      serverTimestamp(),

    updatedBy:
      input.adminUid,
  };

  /*
   * IMPORTANT
   * The coordinator profile document ID is the
   * Firebase Authentication UID.
   *
   * This keeps:
   *
   * users/{UID}
   * coordinators/{UID}
   *
   * connected to the same person.
   */

  const coordinatorRef = doc(
    db,
    COLLECTIONS.coordinators,
    coordinatorUid
  );

  /*
   * CREATE / UPDATE COORDINATOR PROFILE
   */

  await setDoc(
    coordinatorRef,
    {
      ...payload,

      createdAt:
        serverTimestamp(),

      createdBy:
        input.adminUid,
    },
    {
      merge: true,
    }
  );

  /*
   * UPDATE USER PROFILE TOO
   *
   * We DO NOT create the Firebase Auth account here.
   * The account should already exist in Firebase Authentication.
   *
   * This only keeps users/{UID} synchronized.
   */

  const userRef = doc(
    db,
    'users',
    coordinatorUid
  );

  await setDoc(
    userRef,
    {
      uid: coordinatorUid,

      fullName:
        input.name.trim(),

      name:
        input.name.trim(),

      department:
        input.department.trim(),

      departmentCode:
        input.departmentCode.trim(),

      designation:
        input.designation.trim(),

      role: 'coordinator',

      academicYear:
        input.academicYear.trim(),

      year: 'Faculty/Admin',

      section: 'N/A',

      bio:
        input.bio.trim(),

      photoURL:
        photoUrl,

      active: true,

      updatedAt:
        serverTimestamp(),

      updatedBy:
        input.adminUid,
    },
    {
      merge: true,
    }
  );

  return coordinatorUid;
}

export async function removeCoordinator(
  id: string
) {
  await deleteDoc(
    doc(
      db,
      COLLECTIONS.coordinators,
      id
    )
  );
}
/* =========================================================
   MONTHLY ACTIVITIES
   PAYMENT-FREE
   IMAGE URL ONLY
========================================================= */

export async function saveMonthlyActivity(
  input: {
    id?: string;
    title: string;
    date: string;
    category: string;
    summary: string;
    imageUrl?: string;
    adminUid: string;
  }
) {
  const activityDate = new Date(
    `${input.date}T12:00:00`
  );

  const now = new Date();

  const currentMonth =
    activityDate.getFullYear() === now.getFullYear() &&
    activityDate.getMonth() === now.getMonth();

  const previousDate = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  const previousMonth =
    activityDate.getFullYear() ===
      previousDate.getFullYear() &&
    activityDate.getMonth() ===
      previousDate.getMonth();

  const payload = {
    title: input.title.trim(),

    date: input.date,

    category: input.category.trim(),

    summary: input.summary.trim(),

    imageUrl:
      input.imageUrl?.trim() || '',

    imagePath: '',

    isPreviousMonth:
      previousMonth && !currentMonth,

    active: true,

    updatedAt: serverTimestamp(),

    updatedBy: input.adminUid,
  };

  if (input.id) {
    await setDoc(
      doc(
        db,
        COLLECTIONS.monthlyActivities,
        input.id
      ),
      payload,
      {
        merge: true,
      }
    );

    return {
      id: input.id,
      ...payload,
    };
  }

  const ref = await addDoc(
    collection(
      db,
      COLLECTIONS.monthlyActivities
    ),
    {
      ...payload,

      createdAt: serverTimestamp(),

      createdBy: input.adminUid,
    }
  );

  return {
    id: ref.id,
    ...payload,
  };
}


export async function removeMonthlyActivity(
  id: string
) {
  await deleteDoc(
    doc(
      db,
      COLLECTIONS.monthlyActivities,
      id
    )
  );
}