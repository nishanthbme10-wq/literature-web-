import type { UserProfile } from './firebase';

export type AppRole = 'admin' | 'coordinator' | 'student';

export function hasRole(profile: UserProfile | null | undefined, role: AppRole) {
  return profile?.active === true && profile.role === role;
}

export function isAdmin(profile: UserProfile | null | undefined) {
  return hasRole(profile, 'admin');
}

export function isCoordinator(profile: UserProfile | null | undefined) {
  return hasRole(profile, 'coordinator');
}

export function isStudent(profile: UserProfile | null | undefined) {
  return hasRole(profile, 'student');
}

export function canManageContent(profile: UserProfile | null | undefined) {
  return isAdmin(profile);
}

export function canManageAttendance(profile: UserProfile | null | undefined) {
  return isAdmin(profile) || isCoordinator(profile);
}
