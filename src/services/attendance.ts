import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { COLLECTIONS, type AttendanceDocument, type RegistrationDocument } from '../firebase/firestore-schema';

export type QrPayload = {
  v: number;
  type: 'literature-club-registration';
  registrationId: string;
  registrationDocId?: string;
  token: string;
};

export type AttendanceVerificationMethod = 'qr' | 'registration_id' | 'register_number';

export type AttendanceVerificationResult = RegistrationDocument & {
  id: string;
  attendanceStatus: 'present';
  verifiedBy: string;
  verificationMethod: AttendanceVerificationMethod;
};

function clean(value: string) { return value.trim(); }

function requireAuthorizedStaff() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please sign in as an authorized coordinator or admin.');
  return uid;
}

export function parseRegistrationQr(raw: string): QrPayload {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error('Invalid QR code. Please scan a Literature Club registration QR.'); }
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid QR code.');
  const value = parsed as Record<string, unknown>;
  if (value.type !== 'literature-club-registration' || value.v !== 1 || typeof value.registrationId !== 'string' || typeof value.token !== 'string') {
    throw new Error('This QR code is not a valid Literature Club registration QR.');
  }
  if (!/^[A-Za-z0-9_-]{3,120}$/.test(value.token)) throw new Error('Invalid QR security token.');
  return { v: 1, type: 'literature-club-registration', registrationId: value.registrationId, registrationDocId: typeof value.registrationDocId === 'string' ? value.registrationDocId : undefined, token: value.token };
}

async function findRegistrationByQr(payload: QrPayload) {
  if (payload.registrationDocId) {
    const registrationRef = doc(db, COLLECTIONS.registrations, payload.registrationDocId);
    const snapshot = await getDoc(registrationRef);
    if (!snapshot.exists()) throw new Error('Registration could not be verified.');
    const data = snapshot.data() as RegistrationDocument;
    if (data.registrationId !== payload.registrationId || data.qrToken !== payload.token) throw new Error('QR security verification failed.');
    return { ref: registrationRef, data: { id: snapshot.id, ...data } };
  }

  const tokenSnapshot = await getDoc(doc(db, COLLECTIONS.qrTokens, payload.token));
  if (!tokenSnapshot.exists()) throw new Error('This QR was issued before the current verification system. Please generate a fresh registration QR.');
  const tokenData = tokenSnapshot.data();
  if (tokenData.registrationId !== payload.registrationId || tokenData.active !== true) throw new Error('QR security verification failed.');
  const registrationRef = doc(db, COLLECTIONS.registrations, tokenData.registrationDocId);
  const snapshot = await getDoc(registrationRef);
  if (!snapshot.exists()) throw new Error('Registration could not be verified.');
  return { ref: registrationRef, data: { id: snapshot.id, ...snapshot.data() } as RegistrationDocument & { id: string } };
}

async function findRegistrationByRegistrationId(registrationId: string) {
  const value = clean(registrationId).toUpperCase();
  if (!/^LC\d{2}-[A-Z0-9]+-[A-Z0-9]+-\d{3,}$/.test(value)) throw new Error('Enter a valid Literature Club Registration ID.');
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.registrations), where('registrationId', '==', value)));
  if (snapshot.empty) throw new Error('Registration ID not found.');
  if (snapshot.size > 1) throw new Error('Multiple records matched this Registration ID. Contact the administrator.');
  const item = snapshot.docs[0];
  return { ref: item.ref, data: { id: item.id, ...item.data() } as RegistrationDocument & { id: string } };
}

async function findRegistrationByRegisterNumber(registerNumber: string, eventId: string) {
  const value = clean(registerNumber).toUpperCase();
  const selectedEventId = clean(eventId);
  if (!value) throw new Error('Enter the college Register Number.');
  if (!selectedEventId) throw new Error('Select an event before searching by Register Number.');
  const snapshot = await getDocs(query(
    collection(db, COLLECTIONS.registrations),
    where('registerNumber', '==', value),
    where('eventId', '==', selectedEventId),
  ));
  if (snapshot.empty) throw new Error('No registration found for this Register Number in the selected event.');
  if (snapshot.size > 1) throw new Error('Multiple registrations matched. Contact the administrator.');
  const item = snapshot.docs[0];
  return { ref: item.ref, data: { id: item.id, ...item.data() } as RegistrationDocument & { id: string } };
}

async function markAttendance(registration: { ref: ReturnType<typeof doc>; data: RegistrationDocument & { id: string } }, method: AttendanceVerificationMethod) {
  const verifierUid = requireAuthorizedStaff();
  const registrationRef = registration.ref;
  const attendanceRef = doc(db, COLLECTIONS.attendance, registration.data.registrationId);

  const result = await runTransaction(db, async (transaction) => {
    const [registrationSnapshot, attendanceSnapshot] = await Promise.all([
      transaction.get(registrationRef),
      transaction.get(attendanceRef),
    ]);
    if (!registrationSnapshot.exists()) throw new Error('Registration no longer exists.');
    const current = registrationSnapshot.data() as RegistrationDocument;
    if (current.registrationStatus !== 'registered') throw new Error('This registration is cancelled or inactive.');
    if (attendanceSnapshot.exists() && attendanceSnapshot.data().attendanceStatus === 'present') {
      throw new Error('Attendance is already marked present for this registration.');
    }

    const attendance: AttendanceDocument = {
      registrationId: current.registrationId,
      studentUid: current.studentUid,
      eventId: current.eventId,
      eventName: current.eventName,
      attendanceStatus: 'present',
      attendedAt: serverTimestamp() as AttendanceDocument['attendedAt'],
      verifiedBy: verifierUid,
      verificationMethod: method,
    };

    transaction.set(attendanceRef, attendance, { merge: true });
    transaction.update(registrationRef, {
      attendanceStatus: 'present',
      attendedAt: serverTimestamp(),
      verifiedBy: verifierUid,
      verificationMethod: method,
      updatedAt: serverTimestamp(),
    });

    return {
      id: registrationSnapshot.id,
      ...current,
      attendanceStatus: 'present' as const,
      verifiedBy: verifierUid,
      verificationMethod: method,
    };
  });

  return result as AttendanceVerificationResult;
}

export async function markAttendanceByQr(rawQr: string) {
  requireAuthorizedStaff();
  const payload = parseRegistrationQr(rawQr);
  const registration = await findRegistrationByQr(payload);
  return markAttendance(registration, 'qr');
}

export async function markAttendanceByRegistrationId(registrationId: string) {
  const registration = await findRegistrationByRegistrationId(registrationId);
  return markAttendance(registration, 'registration_id');
}

export async function markAttendanceByRegisterNumber(registerNumber: string, eventId: string) {
  const registration = await findRegistrationByRegisterNumber(registerNumber, eventId);
  return markAttendance(registration, 'register_number');
}

export async function getVerificationEvents() {
  const uid = requireAuthorizedStaff();
  const userSnapshot = await getDoc(doc(db, COLLECTIONS.users, uid));
  if (!userSnapshot.exists()) throw new Error('User profile not found.');
  const user = userSnapshot.data();
  if (user.role === 'admin') {
    const events = await getDocs(collection(db, COLLECTIONS.events));
    return events.docs.map(item => ({ id: item.id, ...item.data() }));
  }
  if (user.role !== 'coordinator') throw new Error('Only coordinators and admins can verify attendance.');

  const assignments = await getDocs(query(collection(db, COLLECTIONS.coordinatorAssignments), where('coordinatorUid', '==', uid), where('active', '==', true)));
  const eventIds = assignments.docs.map(item => item.data().eventId as string);
  if (!eventIds.length) return [];
  const events = await Promise.all(eventIds.map(async eventId => {
    const eventSnapshot = await getDoc(doc(db, COLLECTIONS.events, eventId));
    return eventSnapshot.exists() ? { id: eventSnapshot.id, ...eventSnapshot.data() } : null;
  }));
  return events.filter(Boolean);
}
