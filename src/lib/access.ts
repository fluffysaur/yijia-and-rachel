import type { InviteGroup, InviteWithRsvp, RsvpResponse } from "../types/rsvp";
import type { EventDetails } from "../types/wedding";

export type AccessRole = "lunch" | "full" | "admin";

export type AccessSession = {
  role: AccessRole;
  expiresAt: number;
  token: string;
  inviteGroupId?: string | null;
};

export const accessSessionStorageKey = "wedding-access-session";

export function isAccessRole(value: unknown): value is AccessRole {
  return value === "lunch" || value === "full" || value === "admin";
}

export function isSessionActive(session: AccessSession | null, now = Date.now()) {
  return Boolean(session && session.expiresAt > now);
}

export function readAccessSession(storage: Storage = sessionStorage): AccessSession | null {
  const stored = storage.getItem(accessSessionStorageKey);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<AccessSession>;
    if (!isAccessRole(parsed.role) || typeof parsed.expiresAt !== "number" || typeof parsed.token !== "string") {
      return null;
    }

    const session = {
      role: parsed.role,
      expiresAt: parsed.expiresAt,
      token: parsed.token,
      inviteGroupId: typeof parsed.inviteGroupId === "string" ? parsed.inviteGroupId : null,
    };
    return isSessionActive(session) ? session : null;
  } catch {
    return null;
  }
}

export function saveAccessSession(session: AccessSession, storage: Storage = sessionStorage) {
  storage.setItem(accessSessionStorageKey, JSON.stringify(session));
}

export function clearAccessSession(storage: Storage = sessionStorage) {
  storage.removeItem(accessSessionStorageKey);
}

export function canSeeDinner(role: AccessRole | null) {
  return role === "full" || role === "admin";
}

export function filterEventsForRole(events: EventDetails[], role: AccessRole | null) {
  return canSeeDinner(role) ? events : events.filter((event) => event.id !== "dinner");
}

export function filterInviteForRole(invite: InviteGroup, role: AccessRole | null): InviteGroup {
  if (canSeeDinner(role)) return invite;

  return {
    ...invite,
    dinnerGuestNames: [],
    dinnerAllowedCount: 0,
  };
}

export function filterRsvpForRole(rsvp: RsvpResponse | null, role: AccessRole | null): RsvpResponse | null {
  if (!rsvp || canSeeDinner(role)) return rsvp;

  return {
    ...rsvp,
    dinnerAttendingCount: 0,
    dinnerAttendees: [],
  };
}

export function filterInviteWithRsvpForRole(result: InviteWithRsvp, role: AccessRole | null): InviteWithRsvp {
  return {
    inviteGroup: filterInviteForRole(result.inviteGroup, role),
    rsvp: filterRsvpForRole(result.rsvp, role),
  };
}
