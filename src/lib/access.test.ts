import { describe, expect, it } from "vitest";
import {
  filterEventsForRole,
  filterInviteForRole,
  filterRsvpForRole,
  isSessionActive,
  type AccessSession,
} from "./access";
import type { InviteGroup, RsvpResponse } from "../types/rsvp";
import type { EventDetails } from "../types/wedding";

describe("access helpers", () => {
  it("expires sessions after their expiry time", () => {
    const session: AccessSession = { role: "full", expiresAt: 2000, token: "token" };

    expect(isSessionActive(session, 1999)).toBe(true);
    expect(isSessionActive(session, 2000)).toBe(false);
  });

  it("hides dinner events for lunch access", () => {
    const events = [
      { id: "ceremony", title: "Church" },
      { id: "dinner", title: "Dinner" },
    ] as EventDetails[];

    expect(filterEventsForRole(events, "lunch").map((event) => event.id)).toEqual(["ceremony"]);
    expect(filterEventsForRole(events, "full").map((event) => event.id)).toEqual(["ceremony", "dinner"]);
  });

  it("removes dinner invitation and RSVP data for lunch access", () => {
    const invite: InviteGroup = {
      id: "invite-1",
      groupName: "Tan",
      guestNames: ["A"],
      dinnerGuestNames: ["A"],
      ceremonyAllowedCount: 1,
      dinnerAllowedCount: 1,
    };
    const rsvp: RsvpResponse = {
      id: "rsvp-1",
      inviteGroupId: "invite-1",
      responderName: "A",
      ceremonyAttendingCount: 1,
      dinnerAttendingCount: 1,
      generalNotes: "",
      lockedForGuestEdit: true,
      submittedAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      ceremonyAttendees: [{ attendeeIndex: 1, attendeeLabel: "A", dietaryPreference: "" }],
      dinnerAttendees: [{ attendeeIndex: 1, attendeeLabel: "A", mealOption: "Option 1", dietaryPreference: "" }],
    };

    expect(filterInviteForRole(invite, "lunch")).toMatchObject({
      dinnerGuestNames: [],
      dinnerAllowedCount: 0,
    });
    expect(filterRsvpForRole(rsvp, "lunch")).toMatchObject({
      dinnerAttendingCount: 0,
      dinnerAttendees: [],
    });
  });
});
