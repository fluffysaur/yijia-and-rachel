import { demoInviteGroups, demoResponses } from "../data/demo";
import type {
  AdminSummary,
  DinnerMealOption,
  InviteGroup,
  InviteWithRsvp,
  RsvpDraft,
  RsvpResponse
} from "../types/rsvp";
import { dinnerMealOptions } from "../types/rsvp";
import { normalizeName } from "./name";
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

const mapResponse = (
  row: Record<string, unknown>,
  ceremonyAttendees: Record<string, unknown>[] = [],
  dinnerAttendees: Record<string, unknown>[] = []
): RsvpResponse => ({
  id: String(row.id),
  inviteGroupId: String(row.invite_group_id ?? row.inviteGroupId),
  responderName: String(row.responder_name ?? row.responderName),
  ceremonyAttendingCount: Number(row.ceremony_attending_count ?? row.ceremonyAttendingCount),
  dinnerAttendingCount: Number(row.dinner_attending_count ?? row.dinnerAttendingCount),
  generalNotes: row.general_notes || row.generalNotes ? String(row.general_notes ?? row.generalNotes) : "",
  lockedForGuestEdit: Boolean(row.locked_for_guest_edit ?? row.lockedForGuestEdit),
  submittedAt: String(row.submitted_at ?? row.submittedAt),
  updatedAt: String(row.updated_at ?? row.updatedAt),
  ceremonyAttendees: ceremonyAttendees.map((attendee) => ({
    attendeeIndex: Number(attendee.attendee_index ?? attendee.attendeeIndex),
    attendeeLabel: String(attendee.attendee_label ?? attendee.attendeeLabel),
    dietaryPreference: attendee.dietary_preference || attendee.dietaryPreference ? String(attendee.dietary_preference ?? attendee.dietaryPreference) : ""
  })),
  dinnerAttendees: dinnerAttendees.map((attendee) => ({
    attendeeIndex: Number(attendee.attendee_index ?? attendee.attendeeIndex),
    attendeeLabel: String(attendee.attendee_label ?? attendee.attendeeLabel),
    mealOption: String(attendee.meal_option ?? attendee.mealOption) as DinnerMealOption,
    dietaryPreference: attendee.dietary_preference || attendee.dietaryPreference ? String(attendee.dietary_preference ?? attendee.dietaryPreference) : ""
  }))
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
  const rows = await listAdminInvites();
  const groups = rows;
  const responses = rows.map((row) => row.rsvp).filter((response): response is RsvpResponse => response !== null);

  const mealCounts = Object.fromEntries(dinnerMealOptions.map((option) => [option, 0])) as Record<DinnerMealOption, number>;
  responses.forEach((response) => {
    response.dinnerAttendees.forEach((attendee) => {
      mealCounts[attendee.mealOption] += 1;
    });
  });

  return {
    totalInviteGroups: groups.length,
    ceremonyInvited: groups.reduce((sum, group) => sum + group.ceremonyAllowedCount, 0),
    ceremonyAttending: responses.reduce((sum, response) => sum + response.ceremonyAttendingCount, 0),
    dinnerInvited: groups.reduce((sum, group) => sum + group.dinnerAllowedCount, 0),
    dinnerAttending: responses.reduce((sum, response) => sum + response.dinnerAttendingCount, 0),
    pendingResponses: groups.length - responses.length,
    mealCounts
  };
}

export async function listAdminInvites() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return demoInviteGroups.map((group) => ({
      ...group,
      rsvp: getDemoResponse(group.id)
    }));
  }

  const { data: inviteRows, error: inviteError } = await supabase
    .from("invite_groups")
    .select("*")
    .order("group_name", { ascending: true });
  if (inviteError) throw inviteError;

  const { data: responseRows, error: responseError } = await supabase.from("rsvp_responses").select("*");
  if (responseError) throw responseError;

  const responseIds = (responseRows ?? []).map((row) => row.id);
  const { data: ceremonyRows, error: ceremonyError } = responseIds.length
    ? await supabase.from("ceremony_attendees").select("*").in("rsvp_response_id", responseIds)
    : { data: [], error: null };
  if (ceremonyError) throw ceremonyError;

  const { data: dinnerRows, error: dinnerError } = responseIds.length
    ? await supabase.from("dinner_attendees").select("*").in("rsvp_response_id", responseIds)
    : { data: [], error: null };
  if (dinnerError) throw dinnerError;

  return (inviteRows ?? []).map((inviteRow) => {
    const responseRow = (responseRows ?? []).find((row) => row.invite_group_id === inviteRow.id);
    const rsvp = responseRow
      ? mapResponse(
          responseRow,
          (ceremonyRows ?? []).filter((row) => row.rsvp_response_id === responseRow.id),
          (dinnerRows ?? []).filter((row) => row.rsvp_response_id === responseRow.id)
        )
      : null;

    return {
      ...mapInviteGroup(inviteRow),
      rsvp
    };
  });
}

export async function createAdminInviteGroup(input: {
  groupName: string;
  guestNames?: string[];
  dinnerGuestNames?: string[];
  ceremonyAllowedCount: number;
  dinnerAllowedCount: number;
  notes: string;
}) {
  const supabase = getSupabaseBrowserClient();
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

  if (!supabase) {
    demoInviteGroups.push(inviteGroup);
    return inviteGroup;
  }

  const { data, error } = await supabase
    .from("invite_groups")
    .insert({
      group_name: input.groupName,
      normalized_name: normalizeName([input.groupName, ...guestNames, ...dinnerGuestNames].join(" ")),
      guest_names: guestNames,
      dinner_guest_names: dinnerGuestNames,
      ceremony_allowed_count: guestNames.length,
      dinner_allowed_count: dinnerGuestNames.length,
      notes: input.notes || null
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapInviteGroup(data);
}

export async function deleteAdminInviteGroup(inviteGroupId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    const index = demoInviteGroups.findIndex((group) => group.id === inviteGroupId);
    if (index >= 0) demoInviteGroups.splice(index, 1);
    localStorage.removeItem(localStorageKey(inviteGroupId));
    return;
  }

  const { error } = await supabase.from("invite_groups").delete().eq("id", inviteGroupId);
  if (error) throw error;
}

export async function updateAdminRsvp(response: RsvpResponse) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    localStorage.setItem(localStorageKey(response.inviteGroupId), JSON.stringify({ ...response, updatedAt: new Date().toISOString() }));
    return;
  }

  const { error: responseError } = await supabase
    .from("rsvp_responses")
    .update({
      responder_name: response.responderName,
      ceremony_attending_count: response.ceremonyAttendingCount,
      dinner_attending_count: response.dinnerAttendingCount,
      general_notes: response.generalNotes,
      updated_at: new Date().toISOString()
    })
    .eq("id", response.id);
  if (responseError) throw responseError;

  const { error: deleteCeremonyError } = await supabase.from("ceremony_attendees").delete().eq("rsvp_response_id", response.id);
  if (deleteCeremonyError) throw deleteCeremonyError;

  const { error: deleteDinnerError } = await supabase.from("dinner_attendees").delete().eq("rsvp_response_id", response.id);
  if (deleteDinnerError) throw deleteDinnerError;

  if (response.ceremonyAttendees.length) {
    const { error } = await supabase.from("ceremony_attendees").insert(
      response.ceremonyAttendees.map((attendee) => ({
        rsvp_response_id: response.id,
        attendee_index: attendee.attendeeIndex,
        attendee_label: attendee.attendeeLabel,
        dietary_preference: attendee.dietaryPreference
      }))
    );
    if (error) throw error;
  }

  if (response.dinnerAttendees.length) {
    const { error } = await supabase.from("dinner_attendees").insert(
      response.dinnerAttendees.map((attendee) => ({
        rsvp_response_id: response.id,
        attendee_index: attendee.attendeeIndex,
        attendee_label: attendee.attendeeLabel,
        meal_option: attendee.mealOption,
        dietary_preference: attendee.dietaryPreference
      }))
    );
    if (error) throw error;
  }
}

export async function setAdminCheckIn(inviteGroupId: string, eventType: "ceremony" | "dinner", checkedInNames: string[]) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    localStorage.setItem(`wedding-check-in:${inviteGroupId}:${eventType}`, JSON.stringify(checkedInNames));
    return;
  }

  const { error } = await supabase.from("check_ins").upsert(
    {
      invite_group_id: inviteGroupId,
      event_type: eventType,
      checked_in_count: checkedInNames.length,
      checked_in_names: checkedInNames,
      checked_in_at: new Date().toISOString()
    },
    { onConflict: "invite_group_id,event_type" }
  );
  if (error) throw error;
}
