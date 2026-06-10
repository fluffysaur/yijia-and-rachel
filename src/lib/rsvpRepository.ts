import { demoInviteGroups, demoResponses } from "../data/demo";
import type {
  AdminSummary,
  DinnerMealOption,
  InviteGroup,
  InviteWithRsvp,
  RsvpDraft,
  RsvpResponse
} from "../types/rsvp";
import { normalizeName } from "./name";
import { readAccessSession } from "./access";
import { getSupabaseBrowserClient } from "./supabase";

const localStorageKey = (inviteGroupId: string) => `wedding-rsvp:${inviteGroupId}`;

const mapInviteGroup = (row: Record<string, unknown>): InviteGroup => ({
  id: String(row.id),
  groupName: String(row.group_name ?? row.groupName),
  guestNames: Array.isArray(row.guest_names)
    ? row.guest_names.map(String)
    : Array.isArray(row.guestNames)
      ? row.guestNames.map(String)
      : Array.from({ length: Number(row.ceremony_allowed_count ?? row.ceremonyAllowedCount) }, (_, index) => `Guest ${index + 1}`),
  dinnerGuestNames: Array.isArray(row.dinner_guest_names)
    ? row.dinner_guest_names.map(String)
    : Array.isArray(row.dinnerGuestNames)
      ? row.dinnerGuestNames.map(String)
      : [],
  ceremonyAllowedCount: Number(row.ceremony_allowed_count ?? row.ceremonyAllowedCount),
  dinnerAllowedCount: Number(row.dinner_allowed_count ?? row.dinnerAllowedCount),
  notes: row.notes ? String(row.notes) : null,
  hasSubmitted: Boolean(row.has_submitted ?? row.hasSubmitted)
});

function draftToResponse(draft: RsvpDraft): RsvpResponse {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    inviteGroupId: draft.inviteGroupId,
    responderName: draft.responderName,
    ceremonyAttendingCount: draft.ceremonyAttendingCount,
    dinnerAttendingCount: draft.dinnerAttendingCount,
    generalNotes: draft.generalNotes,
    lockedForGuestEdit: true,
    submittedAt: now,
    updatedAt: now,
    ceremonyAttendees: draft.ceremonyAttendees,
    dinnerAttendees: draft.dinnerAttendees
  };
}

function getDemoResponse(inviteGroupId: string) {
  const stored = localStorage.getItem(localStorageKey(inviteGroupId));
  if (stored) {
    return JSON.parse(stored) as RsvpResponse;
  }

  return demoResponses.find((response) => response.inviteGroupId === inviteGroupId) ?? null;
}

async function adminApiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = readAccessSession();
  if (session?.role !== "admin") {
    throw new Error("Admin session required.");
  }

  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
      ...init.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) {
    throw new Error(payload?.error || "Admin request failed.");
  }
  if (!payload) {
    throw new Error("Admin request returned an empty response.");
  }
  return payload;
}

export async function searchInviteGroups(query: string): Promise<InviteGroup[]> {
  const normalized = normalizeName(query);
  if (normalized.length < 2) {
    return [];
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return demoInviteGroups
      .filter((invite) =>
        normalizeName([invite.groupName, ...invite.guestNames, ...invite.dinnerGuestNames].join(" ")).includes(normalized)
      )
      .map((invite) => ({ ...invite, hasSubmitted: getDemoResponse(invite.id) !== null }));
  }

  const { data, error } = await supabase.rpc("search_invite_groups", { search_text: normalized });
  if (error) {
    throw error;
  }

  return (data ?? []).map(mapInviteGroup);
}

export async function getInviteWithRsvp(inviteGroupId: string): Promise<InviteWithRsvp> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const inviteGroup = demoInviteGroups.find((invite) => invite.id === inviteGroupId);
    if (!inviteGroup) {
      throw new Error("Invite group not found.");
    }

    return {
      inviteGroup,
      rsvp: getDemoResponse(inviteGroupId)
    };
  }

  const { data, error } = await supabase.rpc("get_public_rsvp", { p_invite_group_id: inviteGroupId });
  if (error) {
    throw error;
  }

  if (!data?.invite_group) {
    throw new Error("Invite group not found.");
  }

  const inviteGroup = mapInviteGroup(data.invite_group);
  const response = data.rsvp_response;

  return {
    inviteGroup,
    rsvp: response
      ? {
          id: response.id,
          inviteGroupId: response.invite_group_id,
          responderName: response.responder_name,
          ceremonyAttendingCount: response.ceremony_attending_count,
          dinnerAttendingCount: response.dinner_attending_count,
          generalNotes: response.general_notes ?? "",
          lockedForGuestEdit: response.locked_for_guest_edit,
          submittedAt: response.submitted_at,
          updatedAt: response.updated_at,
          ceremonyAttendees: (data.ceremony_attendees ?? []).map(
            (attendee: Record<string, unknown>) => ({
              attendeeIndex: Number(attendee.attendee_index),
              attendeeLabel: String(attendee.attendee_label),
              dietaryPreference: attendee.dietary_preference ? String(attendee.dietary_preference) : ""
            })
          ),
          dinnerAttendees: (data.dinner_attendees ?? []).map((attendee: Record<string, unknown>) => ({
            attendeeIndex: Number(attendee.attendee_index),
            attendeeLabel: String(attendee.attendee_label),
            mealOption: String(attendee.meal_option) as DinnerMealOption,
            dietaryPreference: attendee.dietary_preference ? String(attendee.dietary_preference) : ""
          }))
        }
      : null
  };
}

export async function submitGuestRsvp(draft: RsvpDraft): Promise<RsvpResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const response = draftToResponse(draft);
    localStorage.setItem(localStorageKey(draft.inviteGroupId), JSON.stringify(response));
    return response;
  }

  const { error } = await supabase.rpc("submit_guest_rsvp", {
    payload: {
      invite_group_id: draft.inviteGroupId,
      responder_name: draft.responderName,
      ceremony_attending_count: draft.ceremonyAttendingCount,
      dinner_attending_count: draft.dinnerAttendingCount,
      general_notes: draft.generalNotes,
      ceremony_attendees: draft.ceremonyAttendees,
      dinner_attendees: draft.dinnerAttendees
    }
  });

  if (error) {
    throw error;
  }

  const result = await getInviteWithRsvp(draft.inviteGroupId);
  if (!result.rsvp) {
    throw new Error("RSVP submitted but could not be loaded.");
  }

  return result.rsvp;
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const payload = await adminApiJson<{ summary: AdminSummary }>("/api/admin/summary");
  return payload.summary;
}

export async function listAdminInvites() {
  const payload = await adminApiJson<{ rows: (InviteGroup & { rsvp: RsvpResponse | null })[] }>("/api/admin/invites");
  return payload.rows;
}

export async function createAdminInviteGroup(input: {
  groupName: string;
  guestNames?: string[];
  dinnerGuestNames?: string[];
  ceremonyAllowedCount: number;
  dinnerAllowedCount: number;
  notes: string;
}) {
  const providedGuestNames = input.guestNames?.filter(Boolean) ?? [];
  const guestNames = providedGuestNames.length
    ? providedGuestNames
    : Array.from({ length: input.ceremonyAllowedCount }, (_, index) => `Guest ${index + 1}`);
  const providedDinnerGuestNames = input.dinnerGuestNames?.filter(Boolean) ?? [];
  const dinnerGuestNames = providedDinnerGuestNames.length ? providedDinnerGuestNames : guestNames.slice(0, input.dinnerAllowedCount);
  const inviteGroup: InviteGroup = {
    id: crypto.randomUUID(),
    groupName: input.groupName,
    guestNames,
    dinnerGuestNames,
    ceremonyAllowedCount: input.ceremonyAllowedCount,
    dinnerAllowedCount: input.dinnerAllowedCount,
    notes: input.notes
  };

  const payload = await adminApiJson<{ invite: InviteGroup }>("/api/admin/invites", {
    method: "POST",
    body: JSON.stringify(inviteGroup),
  });
  return payload.invite;
}

export async function deleteAdminInviteGroup(inviteGroupId: string) {
  await adminApiJson<{ ok: boolean }>(`/api/admin/invites/${inviteGroupId}`, { method: "DELETE" });
}

export async function updateAdminInviteGroup(input: {
  id: string;
  groupName: string;
  guestNames: string[];
  dinnerGuestNames: string[];
  notes: string;
}) {
  const payload = await adminApiJson<{ invite: InviteGroup }>(`/api/admin/invites/${input.id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return payload.invite;
}

export async function updateAdminRsvp(response: RsvpResponse) {
  await adminApiJson<{ ok: boolean }>(`/api/admin/rsvp/${response.id}`, {
    method: "PUT",
    body: JSON.stringify({ response }),
  });
}

export async function deleteAdminRsvp(responseId: string) {
  await adminApiJson<{ ok: boolean }>(`/api/admin/rsvp/${responseId}`, { method: "DELETE" });
}

export async function setAdminCheckIn(inviteGroupId: string, eventType: "ceremony" | "dinner", checkedInNames: string[]) {
  await adminApiJson<{ ok: boolean }>("/api/admin/check-ins", {
    method: "PUT",
    body: JSON.stringify({ inviteGroupId, eventType, checkedInNames }),
  });
}

export async function getGuestPasswords() {
  return adminApiJson<{ lunchPassword: string; fullPassword: string }>("/api/admin/settings/passwords");
}

export async function updateGuestPasswords(input: { lunchPassword: string; fullPassword: string }) {
  return adminApiJson<{ lunchPassword: string; fullPassword: string }>("/api/admin/settings/passwords", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
