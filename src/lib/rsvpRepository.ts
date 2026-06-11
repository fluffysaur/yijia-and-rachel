import { demoInviteGroups, demoResponses } from "../data/demo";
import type {
  AdminSummary,
  DinnerMealOption,
  InviteGroup,
  InviteMessageTemplates,
  InviteWithRsvp,
  RsvpDraft,
  RsvpResponse,
  RsvpSettings
} from "../types/rsvp";
import { defaultInviteMessageTemplates } from "./inviteMessage";
import { normalizeName } from "./name";
import { readAccessSession, type AccessRole, type AccessSession } from "./access";
import { getSupabaseBrowserClient } from "./supabase";

const localStorageKey = (inviteGroupId: string) => `wedding-rsvp:${inviteGroupId}`;
const demoInviteGroupsStorageKey = "wedding-demo-invite-groups";
const demoResponsesStorageKey = "wedding-demo-rsvp-responses";
const demoGuestPasswordsStorageKey = "wedding-demo-guest-passwords";
const demoRsvpSettingsStorageKey = "wedding-demo-rsvp-settings";
const demoInviteMessageTemplatesStorageKey = "wedding-demo-invite-message-templates";

function demoInvitePassword(invite: InviteGroup) {
  return invite.invitePassword?.trim() || `demo-${invite.id.replace(/^demo-/, "")}`;
}

function withDemoInviteDefaults(invite: InviteGroup): InviteGroup {
  return {
    ...invite,
    invitePassword: demoInvitePassword(invite)
  };
}

function withDemoInviteStatus(invite: InviteGroup): InviteGroup {
  return {
    ...withDemoInviteDefaults(invite),
    hasSubmitted: getDemoResponse(invite.id) !== null
  };
}

function readJson<T>(key: string, fallback: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;

  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function readDemoInviteGroups() {
  return readJson<InviteGroup[]>(
    demoInviteGroupsStorageKey,
    demoInviteGroups.map(withDemoInviteDefaults)
  ).map(withDemoInviteDefaults);
}

function writeDemoInviteGroups(invites: InviteGroup[]) {
  localStorage.setItem(demoInviteGroupsStorageKey, JSON.stringify(invites.map(withDemoInviteDefaults)));
}

function readDemoResponses() {
  const responses = readJson<RsvpResponse[]>(demoResponsesStorageKey, demoResponses);
  const migratedResponses = readDemoInviteGroups().reduce<RsvpResponse[]>((items, invite) => {
    const stored = localStorage.getItem(localStorageKey(invite.id));
    if (!stored || items.some((response) => response.inviteGroupId === invite.id)) return items;

    try {
      return [...items, JSON.parse(stored) as RsvpResponse];
    } catch {
      return items;
    }
  }, responses);

  if (migratedResponses.length !== responses.length) {
    writeDemoResponses(migratedResponses);
  }

  return migratedResponses;
}

function writeDemoResponses(responses: RsvpResponse[]) {
  localStorage.setItem(demoResponsesStorageKey, JSON.stringify(responses));
}

function readDemoGuestPasswords() {
  return readJson(demoGuestPasswordsStorageKey, {
    lunchPassword: "samplechurchpass",
    fullPassword: "sampledinnerpass"
  });
}

function readDemoRsvpSettings(): RsvpSettings {
  return readJson<RsvpSettings>(demoRsvpSettingsStorageKey, { rsvpDeadline: null });
}

function readDemoInviteMessageTemplates(): InviteMessageTemplates {
  return {
    ...defaultInviteMessageTemplates,
    ...readJson<Partial<InviteMessageTemplates>>(demoInviteMessageTemplatesStorageKey, {})
  };
}

function assertRsvpWritesOpen(settings = readDemoRsvpSettings()) {
  if (settings.rsvpDeadline && Date.now() >= new Date(settings.rsvpDeadline).getTime()) {
    throw new Error("The RSVP deadline has passed. Please contact us for changes.");
  }
}

export function createDemoSessionForPassword(password: string): AccessSession | null {
  const normalizedPassword = password.trim();
  const { lunchPassword, fullPassword } = readDemoGuestPasswords();
  const adminPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "adminpass";
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000;

  if (normalizedPassword === adminPassword) {
    return { role: "admin" as const, expiresAt, token: `demo-admin-${expiresAt}`, inviteGroupId: null };
  }

  if (normalizedPassword === fullPassword) {
    return { role: "full" as const, expiresAt, token: `demo-full-${expiresAt}`, inviteGroupId: null };
  }

  if (normalizedPassword === lunchPassword) {
    return { role: "lunch" as const, expiresAt, token: `demo-lunch-${expiresAt}`, inviteGroupId: null };
  }

  const invite = readDemoInviteGroups().find((row) => row.invitePassword === normalizedPassword);
  if (invite) {
    const role: AccessRole = invite.dinnerAllowedCount > 0 || invite.dinnerGuestNames.length > 0 ? "full" : "lunch";
    return { role, expiresAt, token: `demo-${role}-${invite.id}-${expiresAt}`, inviteGroupId: invite.id };
  }

  return null;
}

const mapInviteGroup = (row: Record<string, unknown>): InviteGroup => ({
  id: String(row.id),
  groupName: String(row.group_name ?? row.groupName),
  invitePassword: row.invite_password || row.invitePassword ? String(row.invite_password ?? row.invitePassword) : null,
  invitedAt: row.invited_at || row.invitedAt ? String(row.invited_at ?? row.invitedAt) : null,
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
  return readDemoResponses().find((response) => response.inviteGroupId === inviteGroupId) ?? null;
}

function upsertDemoResponse(response: RsvpResponse) {
  const responses = readDemoResponses();
  writeDemoResponses([
    ...responses.filter((item) => item.id !== response.id && item.inviteGroupId !== response.inviteGroupId),
    response
  ]);
  localStorage.setItem(localStorageKey(response.inviteGroupId), JSON.stringify(response));
}

function buildAdminSummary(rows: (InviteGroup & { rsvp: RsvpResponse | null })[]): AdminSummary {
  return rows.reduce<AdminSummary>(
    (summary, row) => {
      summary.totalInviteGroups += 1;
      summary.ceremonyInvited += row.guestNames.length || row.ceremonyAllowedCount;
      summary.dinnerInvited += row.dinnerGuestNames.length || row.dinnerAllowedCount;

      if (row.rsvp) {
        summary.ceremonyAttending += row.rsvp.ceremonyAttendingCount;
        summary.dinnerAttending += row.rsvp.dinnerAttendingCount;
        row.rsvp.dinnerAttendees.forEach((attendee) => {
          summary.mealCounts[attendee.mealOption] += 1;
        });
      } else {
        summary.pendingResponses += 1;
      }

      return summary;
    },
    {
      totalInviteGroups: 0,
      ceremonyInvited: 0,
      ceremonyAttending: 0,
      dinnerInvited: 0,
      dinnerAttending: 0,
      pendingResponses: 0,
      mealCounts: {
        "Option 1": 0,
        "Option 2": 0,
        Halal: 0,
        Vegetarian: 0
      }
    }
  );
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
    return readDemoInviteGroups()
      .filter((invite) =>
        normalizeName([invite.groupName, invite.invitePassword ?? "", ...invite.guestNames, ...invite.dinnerGuestNames].join(" ")).includes(normalized)
      )
      .map(withDemoInviteStatus);
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
    const inviteGroup = readDemoInviteGroups().find((invite) => invite.id === inviteGroupId);
    if (!inviteGroup) {
      throw new Error("Invite group not found.");
    }

    return {
      inviteGroup: withDemoInviteStatus(inviteGroup),
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
    assertRsvpWritesOpen();
    const existing = getDemoResponse(draft.inviteGroupId);
    const response = existing
      ? {
          ...draftToResponse(draft),
          id: existing.id,
          submittedAt: existing.submittedAt
        }
      : draftToResponse(draft);
    upsertDemoResponse(response);
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
  if (!getSupabaseBrowserClient()) {
    return buildAdminSummary(await listAdminInvites());
  }

  const payload = await adminApiJson<{ summary: AdminSummary }>("/api/admin/summary");
  return payload.summary;
}

export async function listAdminInvites() {
  if (!getSupabaseBrowserClient()) {
    const responses = readDemoResponses();
    return readDemoInviteGroups()
      .map((invite) => ({
        ...withDemoInviteStatus(invite),
        rsvp: responses.find((response) => response.inviteGroupId === invite.id) ?? null
      }))
      .sort((first, second) => first.groupName.localeCompare(second.groupName));
  }

  const payload = await adminApiJson<{ rows: (InviteGroup & { rsvp: RsvpResponse | null })[] }>("/api/admin/invites");
  return payload.rows;
}

export async function createAdminInviteGroup(input: {
  groupName: string;
  invitePassword?: string;
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
    invitePassword: input.invitePassword?.trim() || undefined,
    guestNames,
    dinnerGuestNames,
    ceremonyAllowedCount: input.ceremonyAllowedCount,
    dinnerAllowedCount: input.dinnerAllowedCount,
    notes: input.notes,
    invitedAt: null
  };

  if (!getSupabaseBrowserClient()) {
    const invite = withDemoInviteDefaults(inviteGroup);
    writeDemoInviteGroups([...readDemoInviteGroups(), invite]);
    return invite;
  }

  const payload = await adminApiJson<{ invite: InviteGroup }>("/api/admin/invites", {
    method: "POST",
    body: JSON.stringify(inviteGroup),
  });
  return payload.invite;
}

export async function deleteAdminInviteGroup(inviteGroupId: string) {
  if (!getSupabaseBrowserClient()) {
    writeDemoInviteGroups(readDemoInviteGroups().filter((invite) => invite.id !== inviteGroupId));
    writeDemoResponses(readDemoResponses().filter((response) => response.inviteGroupId !== inviteGroupId));
    localStorage.removeItem(localStorageKey(inviteGroupId));
    return;
  }

  await adminApiJson<{ ok: boolean }>(`/api/admin/invites/${inviteGroupId}`, { method: "DELETE" });
}

export async function updateAdminInviteGroup(input: {
  id: string;
  groupName: string;
  invitePassword: string;
  guestNames: string[];
  dinnerGuestNames: string[];
  notes: string;
}) {
  if (!getSupabaseBrowserClient()) {
    const invites = readDemoInviteGroups();
    const existing = invites.find((invite) => invite.id === input.id);
    if (!existing) {
      throw new Error("Invite group not found.");
    }

    const updated = withDemoInviteDefaults({
      ...existing,
      groupName: input.groupName,
      invitePassword: input.invitePassword,
      guestNames: input.guestNames,
      dinnerGuestNames: input.dinnerGuestNames,
      ceremonyAllowedCount: input.guestNames.length,
      dinnerAllowedCount: input.dinnerGuestNames.length,
      notes: input.notes
    });
    writeDemoInviteGroups(invites.map((invite) => (invite.id === input.id ? updated : invite)));
    return updated;
  }

  const payload = await adminApiJson<{ invite: InviteGroup }>(`/api/admin/invites/${input.id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return payload.invite;
}

export async function updateAdminRsvp(response: RsvpResponse) {
  if (!getSupabaseBrowserClient()) {
    upsertDemoResponse({
      ...response,
      updatedAt: new Date().toISOString(),
      submittedAt: response.submittedAt || new Date().toISOString(),
      lockedForGuestEdit: true
    });
    return;
  }

  await adminApiJson<{ ok: boolean }>(`/api/admin/rsvp/${response.id}`, {
    method: "PUT",
    body: JSON.stringify({ response }),
  });
}

export async function deleteAdminRsvp(responseId: string) {
  if (!getSupabaseBrowserClient()) {
    const response = readDemoResponses().find((item) => item.id === responseId);
    writeDemoResponses(readDemoResponses().filter((item) => item.id !== responseId));
    if (response) {
      localStorage.removeItem(localStorageKey(response.inviteGroupId));
    }
    return;
  }

  await adminApiJson<{ ok: boolean }>(`/api/admin/rsvp/${responseId}`, { method: "DELETE" });
}

export async function setAdminCheckIn(inviteGroupId: string, eventType: "ceremony" | "dinner", checkedInNames: string[]) {
  if (!getSupabaseBrowserClient()) {
    localStorage.setItem(`wedding-check-in:${inviteGroupId}:${eventType}`, JSON.stringify(checkedInNames));
    return;
  }

  await adminApiJson<{ ok: boolean }>("/api/admin/check-ins", {
    method: "PUT",
    body: JSON.stringify({ inviteGroupId, eventType, checkedInNames }),
  });
}

export async function getGuestPasswords() {
  if (!getSupabaseBrowserClient()) {
    return readDemoGuestPasswords();
  }

  return adminApiJson<{ lunchPassword: string; fullPassword: string }>("/api/admin/settings/passwords");
}

export async function updateGuestPasswords(input: { lunchPassword: string; fullPassword: string }) {
  if (!getSupabaseBrowserClient()) {
    const passwords = {
      lunchPassword: input.lunchPassword.trim(),
      fullPassword: input.fullPassword.trim()
    };
    localStorage.setItem(demoGuestPasswordsStorageKey, JSON.stringify(passwords));
    return passwords;
  }

  return adminApiJson<{ lunchPassword: string; fullPassword: string }>("/api/admin/settings/passwords", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function getRsvpSettings(): Promise<RsvpSettings> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return readDemoRsvpSettings();
  }

  const { data, error } = await supabase.rpc("get_rsvp_settings");
  if (error) {
    throw error;
  }

  return {
    rsvpDeadline: data?.rsvp_deadline ? String(data.rsvp_deadline) : null
  };
}

export async function updateRsvpSettings(input: RsvpSettings): Promise<RsvpSettings> {
  const rsvpDeadline = input.rsvpDeadline?.trim() || null;
  if (rsvpDeadline && Number.isNaN(new Date(rsvpDeadline).getTime())) {
    throw new Error("RSVP deadline must be a valid date and time.");
  }

  if (!getSupabaseBrowserClient()) {
    const settings = { rsvpDeadline };
    localStorage.setItem(demoRsvpSettingsStorageKey, JSON.stringify(settings));
    return settings;
  }

  return adminApiJson<RsvpSettings>("/api/admin/settings/rsvp", {
    method: "PUT",
    body: JSON.stringify({ rsvpDeadline }),
  });
}

export async function getInviteMessageTemplates(): Promise<InviteMessageTemplates> {
  if (!getSupabaseBrowserClient()) {
    return readDemoInviteMessageTemplates();
  }

  return adminApiJson<InviteMessageTemplates>("/api/admin/settings/invite-messages");
}

export async function updateInviteMessageTemplates(input: InviteMessageTemplates): Promise<InviteMessageTemplates> {
  const templates = {
    lunchTemplate: input.lunchTemplate.trim(),
    dinnerTemplate: input.dinnerTemplate.trim()
  };
  if (!templates.lunchTemplate || !templates.dinnerTemplate) {
    throw new Error("Both invite message templates are required.");
  }

  if (!getSupabaseBrowserClient()) {
    localStorage.setItem(demoInviteMessageTemplatesStorageKey, JSON.stringify(templates));
    return templates;
  }

  return adminApiJson<InviteMessageTemplates>("/api/admin/settings/invite-messages", {
    method: "PUT",
    body: JSON.stringify(templates),
  });
}

export async function updateAdminInviteStatus(inviteGroupId: string, invitedAt: string | null) {
  if (!getSupabaseBrowserClient()) {
    const invites = readDemoInviteGroups();
    const existing = invites.find((invite) => invite.id === inviteGroupId);
    if (!existing) {
      throw new Error("Invite group not found.");
    }

    const updated = { ...existing, invitedAt };
    writeDemoInviteGroups(invites.map((invite) => (invite.id === inviteGroupId ? updated : invite)));
    return updated;
  }

  const payload = await adminApiJson<{ invite: InviteGroup }>(`/api/admin/invites/${inviteGroupId}/status`, {
    method: "PUT",
    body: JSON.stringify({ invitedAt }),
  });
  return payload.invite;
}
