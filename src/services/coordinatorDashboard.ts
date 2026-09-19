import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS, type EventDocument, type RegistrationDocument } from '../firebase/firestore-schema';
import { getVerificationEvents } from './attendance';

export type DashboardEvent = EventDocument & { id: string };
export type DashboardRegistration = RegistrationDocument & { id: string };

export async function getCoordinatorDashboardEvents(): Promise<DashboardEvent[]> {
  return (await getVerificationEvents()) as DashboardEvent[];
}

export async function getEventRegistrations(eventId: string): Promise<DashboardRegistration[]> {
  const cleanId = eventId.trim();
  if (!cleanId) return [];
  const snapshot = await getDocs(query(
    collection(db, COLLECTIONS.registrations),
    where('eventId', '==', cleanId),
    orderBy('registeredAt', 'asc'),
  ));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() })) as DashboardRegistration[];
}

export async function getEventAttendanceCount(eventId: string): Promise<number> {
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.attendance), where('eventId', '==', eventId), where('attendanceStatus', '==', 'present')));
  return snapshot.size;
}

export async function getCoordinatorProfile(uid: string) {
  const snapshot = await getDoc(doc(db, COLLECTIONS.users, uid));
  if (!snapshot.exists()) throw new Error('Coordinator profile not found.');
  return { id: snapshot.id, ...snapshot.data() };
}
