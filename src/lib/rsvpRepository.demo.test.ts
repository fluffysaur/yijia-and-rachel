import { beforeEach, describe, expect, it } from "vitest";
import {
  createAdminInviteGroup,
  createDemoSessionForPassword,
  deleteAdminInviteGroup,
  getAdminSummary,
  getGuestPasswords,
  getRsvpSettings,
  listAdminInvites,
  searchInviteGroups,
  submitGuestRsvp,
  updateAdminInviteGroup,
  updateGuestPasswords,
  updateRsvpSettings,
} from "./rsvpRepository";

describe("demo RSVP repository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads seeded invite rows and admin summary in demo mode", async () => {
    const rows = await listAdminInvites();
    const summary = await getAdminSummary();

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].invitePassword).toMatch(/^demo-/);
    expect(summary.totalInviteGroups).toBe(rows.length);
    expect(summary.pendingResponses).toBeGreaterThan(0);
  });

  it("persists local invite create, update, search, and delete", async () => {
    const created = await createAdminInviteGroup({
      groupName: "Local Test Group",
      invitePassword: "local-test-pass",
      guestNames: ["Local One", "Local Two"],
      dinnerGuestNames: ["Local One"],
      ceremonyAllowedCount: 2,
      dinnerAllowedCount: 1,
      notes: "Created locally",
    });

    expect(await searchInviteGroups("local test")).toEqual([
      expect.objectContaining({ id: created.id, invitePassword: "local-test-pass" }),
    ]);
    expect(createDemoSessionForPassword("local-test-pass")).toMatchObject({
      role: "full",
      inviteGroupId: created.id,
    });

    await updateAdminInviteGroup({
      id: created.id,
      groupName: "Renamed Local Group",
      invitePassword: "renamed-pass",
      guestNames: ["Local One"],
      dinnerGuestNames: [],
      notes: "Updated locally",
    });

    expect(await searchInviteGroups("renamed")).toEqual([
      expect.objectContaining({
        id: created.id,
        groupName: "Renamed Local Group",
        dinnerAllowedCount: 0,
      }),
    ]);
    expect(createDemoSessionForPassword("renamed-pass")).toMatchObject({
      role: "lunch",
      inviteGroupId: created.id,
    });

    await deleteAdminInviteGroup(created.id);
    expect(await searchInviteGroups("renamed")).toEqual([]);
  });

  it("persists demo guest passwords", async () => {
    expect(await getGuestPasswords()).toEqual({
      lunchPassword: "samplechurchpass",
      fullPassword: "sampledinnerpass",
    });

    await updateGuestPasswords({ lunchPassword: "lunch-local", fullPassword: "full-local" });

    expect(await getGuestPasswords()).toEqual({
      lunchPassword: "lunch-local",
      fullPassword: "full-local",
    });
    expect(createDemoSessionForPassword("full-local")).toMatchObject({ role: "full" });
  });

  it("persists demo RSVP deadline settings", async () => {
    expect(await getRsvpSettings()).toEqual({ rsvpDeadline: null });

    const deadline = new Date(Date.now() + 60_000).toISOString();
    await updateRsvpSettings({ rsvpDeadline: deadline });

    expect(await getRsvpSettings()).toEqual({ rsvpDeadline: deadline });
  });

  it("allows demo guest RSVP submission and edits before the deadline", async () => {
    const created = await createAdminInviteGroup({
      groupName: "Editable RSVP Group",
      invitePassword: "editable-pass",
      guestNames: ["Editable One"],
      dinnerGuestNames: [],
      ceremonyAllowedCount: 1,
      dinnerAllowedCount: 0,
      notes: "",
    });
    await updateRsvpSettings({ rsvpDeadline: new Date(Date.now() + 60_000).toISOString() });

    const submitted = await submitGuestRsvp({
      inviteGroupId: created.id,
      responderName: "Editable One",
      ceremonyAttendingCount: 1,
      dinnerAttendingCount: 0,
      generalNotes: "Original note",
      ceremonyAttendees: [{ attendeeIndex: 1, attendeeLabel: "Editable One", dietaryPreference: "" }],
      dinnerAttendees: [],
    });

    const edited = await submitGuestRsvp({
      inviteGroupId: created.id,
      responderName: "Editable One",
      ceremonyAttendingCount: 0,
      dinnerAttendingCount: 0,
      generalNotes: "Updated note",
      ceremonyAttendees: [],
      dinnerAttendees: [],
    });

    expect(edited.id).toBe(submitted.id);
    expect(edited.submittedAt).toBe(submitted.submittedAt);
    expect(edited.generalNotes).toBe("Updated note");
    expect(edited.ceremonyAttendingCount).toBe(0);
  });

  it("blocks demo guest RSVP writes after the deadline", async () => {
    const created = await createAdminInviteGroup({
      groupName: "Closed RSVP Group",
      invitePassword: "closed-pass",
      guestNames: ["Closed One"],
      dinnerGuestNames: [],
      ceremonyAllowedCount: 1,
      dinnerAllowedCount: 0,
      notes: "",
    });
    await updateRsvpSettings({ rsvpDeadline: new Date(Date.now() - 60_000).toISOString() });

    await expect(
      submitGuestRsvp({
        inviteGroupId: created.id,
        responderName: "Closed One",
        ceremonyAttendingCount: 1,
        dinnerAttendingCount: 0,
        generalNotes: "",
        ceremonyAttendees: [{ attendeeIndex: 1, attendeeLabel: "Closed One", dietaryPreference: "" }],
        dinnerAttendees: [],
      }),
    ).rejects.toThrow("The RSVP deadline has passed.");
  });
});
