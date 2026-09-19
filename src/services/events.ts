import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  where,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, uploadClubAsset, deleteClubAsset } from '../lib/firebase';
import { COLLECTIONS, type EventDocument, type EventRegistrationStatus } from '../firebase/firestore-schema';

export type EventInput = Omit<EventDocument, 'createdAt' | 'updatedAt'>;

export interface EventFormInput {
  name: string;
  code: string;
  description: string;
  posterUrl?: string;
  posterPath?: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  rules: string[];
  registrationDeadline: string;
  maxParticipants: number;
  eligibleDepartments: string[];
  registrationStatus: EventRegistrationStatus;
}

export function normalizeEventCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function validateEventInput(input: EventFormInput) {
  const errors: string[] = [];
  if (!input.name.trim()) errors.push('Event name is required.');
  if (!normalizeEventCode(input.code)) errors.push('Event code is required.');
  if (!input.date) errors.push('Event date is required.');
  if (!input.startTime || !input.endTime) errors.push('Start and end time are required.');
  if (input.startTime && input.endTime && input.startTime >= input.endTime) errors.push('End time must be later than start time.');
  if (!input.venue.trim()) errors.push('Venue is required.');
  if (!input.registrationDeadline) errors.push('Registration deadline is required.');
  if (input.date && input.registrationDeadline && input.registrationDeadline > `${input.date}T23:59`) errors.push('Registration deadline cannot be after the event date.');
  if (!Number.isInteger(input.maxParticipants) || input.maxParticipants < 1) errors.push('Maximum participants must be at least 1.');
  if (input.eligibleDepartments.length === 0) errors.push('Select at least one eligible department.');
  return errors;
}

async function assertEventCodeAvailable(code: string, exceptId?: string) {
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.events), where('code', '==', code)));
  const duplicate = snapshot.docs.some((item) => item.id !== exceptId);
  if (duplicate) throw new Error(`Event code ${code} is already in use.`);
}

export async function listEvents() {
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.events), orderBy('date', 'asc')));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as Array<EventDocument & { id: string }>;
}

export async function createEvent(input: EventFormInput, createdBy: string) {
  const errors = validateEventInput(input);
  if (errors.length) throw new Error(errors.join(' '));

  const normalizedCode = normalizeEventCode(input.code);
  await assertEventCodeAvailable(normalizedCode);
  const eventRef = doc(collection(db, COLLECTIONS.events));
  const data: EventInput = {
    name: input.name.trim(),
    code: normalizedCode,
    description: input.description.trim(),
    posterUrl: input.posterUrl?.trim() || '',
    posterPath: input.posterPath,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    venue: input.venue.trim(),
    rules: input.rules.map((rule) => rule.trim()).filter(Boolean),
    registrationDeadline: input.registrationDeadline,
    maxParticipants: input.maxParticipants,
    eligibleDepartments: input.eligibleDepartments,
    registrationStatus: input.registrationStatus,
    createdBy,
  };
  await setDoc(eventRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return eventRef.id;
}

export async function updateEvent(id: string, input: EventFormInput) {
  const errors = validateEventInput(input);
  if (errors.length) throw new Error(errors.join(' '));
  const normalizedCode = normalizeEventCode(input.code);
  await assertEventCodeAvailable(normalizedCode, id);
  await updateDoc(doc(db, COLLECTIONS.events, id), {
    name: input.name.trim(),
    code: normalizedCode,
    description: input.description.trim(),
    posterUrl: input.posterUrl?.trim() || '',
    posterPath: input.posterPath || null,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    venue: input.venue.trim(),
    rules: input.rules.map((rule) => rule.trim()).filter(Boolean),
    registrationDeadline: input.registrationDeadline,
    maxParticipants: input.maxParticipants,
    eligibleDepartments: input.eligibleDepartments,
    registrationStatus: input.registrationStatus,
    updatedAt: serverTimestamp(),
  });
}

export async function deactivateEvent(id: string) {
  await updateDoc(doc(db, COLLECTIONS.events, id), {
    registrationStatus: 'closed',
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.events, id));
}

export async function uploadEventPoster(file: File, eventId: string) {
  return uploadClubAsset(file, `events/${eventId}`);
}

export async function removeEventPoster(path?: string) {
  if (!path) return;
  try {
    await deleteClubAsset(path);
  } catch {
    // A missing storage object should not block event editing.
  }
}
