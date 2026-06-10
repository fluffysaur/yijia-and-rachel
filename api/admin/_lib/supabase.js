import { createClient } from "@supabase/supabase-js";

let client = null;

export function getServiceClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    throw new Error("VITE_SUPABASE_URL and SUPABASE_SECRET_KEY are required.");
  }

  client ??= createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return client;
}

export function mapInviteGroup(row) {
  return {
    id: String(row.id),
    groupName: String(row.group_name ?? row.groupName),
    guestNames: Array.isArray(row.guest_names) ? row.guest_names.map(String) : [],
    dinnerGuestNames: Array.isArray(row.dinner_guest_names) ? row.dinner_guest_names.map(String) : [],
    ceremonyAllowedCount: Number(row.ceremony_allowed_count ?? row.ceremonyAllowedCount),
    dinnerAllowedCount: Number(row.dinner_allowed_count ?? row.dinnerAllowedCount),
    notes: row.notes ? String(row.notes) : null,
    hasSubmitted: Boolean(row.has_submitted ?? row.hasSubmitted),
  };
}

export function mapResponse(row, ceremonyAttendees = [], dinnerAttendees = []) {
  return {
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
      dietaryPreference:
        attendee.dietary_preference || attendee.dietaryPreference
          ? String(attendee.dietary_preference ?? attendee.dietaryPreference)
          : "",
    })),
    dinnerAttendees: dinnerAttendees.map((attendee) => ({
      attendeeIndex: Number(attendee.attendee_index ?? attendee.attendeeIndex),
      attendeeLabel: String(attendee.attendee_label ?? attendee.attendeeLabel),
      mealOption: String(attendee.meal_option ?? attendee.mealOption),
      dietaryPreference:
        attendee.dietary_preference || attendee.dietaryPreference
          ? String(attendee.dietary_preference ?? attendee.dietaryPreference)
          : "",
    })),
  };
}

export function normalizeName(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export async function listAdminInviteRows() {
  const supabase = getServiceClient();
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
          (dinnerRows ?? []).filter((row) => row.rsvp_response_id === responseRow.id),
        )
      : null;

    return {
      ...mapInviteGroup(inviteRow),
      rsvp,
    };
  });
}

export async function readGuestPasswords() {
  const fallback = {
    lunchPassword: process.env.LUNCH_PASSWORD || "samplechurchpass",
    fullPassword: process.env.FULL_PASSWORD || "sampledinnerpass",
  };

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["lunch_password", "full_password"]);
    if (error) throw error;

    const values = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
    return {
      lunchPassword: values.lunch_password || fallback.lunchPassword,
      fullPassword: values.full_password || fallback.fullPassword,
    };
  } catch {
    return fallback;
  }
}
