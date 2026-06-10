import { describe, expect, it } from "vitest";
import type { InviteGroup, RsvpDraft } from "../types/rsvp";
import { isGuestReadOnly, validateRsvpDraft } from "./rsvpValidation";

const inviteGroup: InviteGroup = {
  id: "invite-1",
  groupName: "Tan Family",
  guestNames: ["Daniel Tan", "Grace Tan", "Ethan Tan", "Emma Tan"],
  dinnerGuestNames: ["Daniel Tan", "Grace Tan"],
  ceremonyAllowedCount: 4,
  dinnerAllowedCount: 2
};

const validDraft: RsvpDraft = {
  inviteGroupId: "invite-1",
  responderName: "Tan",
  ceremonyAttendingCount: 2,
  dinnerAttendingCount: 1,
  generalNotes: "",
  ceremonyAttendees: [
    { attendeeIndex: 1, attendeeLabel: "Guest 1", dietaryPreference: "" },
    { attendeeIndex: 2, attendeeLabel: "Guest 2", dietaryPreference: "No beef" }
  ],
  dinnerAttendees: [{ attendeeIndex: 1, attendeeLabel: "Guest 1", mealOption: "Halal", dietaryPreference: "" }]
};

describe("validateRsvpDraft", () => {
  it("accepts a complete RSVP with separate ceremony and dinner details", () => {
    expect(validateRsvpDraft(inviteGroup, validDraft).valid).toBe(true);
  });

  it("rejects dinner attendees when the invite group has no dinner allocation", () => {
    const result = validateRsvpDraft(
      { ...inviteGroup, dinnerAllowedCount: 0 },
      { ...validDraft, dinnerAttendingCount: 1 }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Dinner count must be between 0 and 0.");
  });

  it("requires ceremony attendee rows to match the ceremony count", () => {
    const result = validateRsvpDraft(inviteGroup, { ...validDraft, ceremonyAttendingCount: 3 });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Church ceremony attendee dietary rows must match the church ceremony attendance count.");
  });
});

describe("isGuestReadOnly", () => {
  it("locks guest editing after submission", () => {
    expect(isGuestReadOnly(true)).toBe(true);
    expect(isGuestReadOnly(false)).toBe(false);
  });
});
