import { beforeEach, describe, expect, it } from "vitest";
import {
  createAdminInviteGroup,
  getActiveCheckInEvent,
  getGuestCheckInState,
  setActiveCheckInEvent,
  submitGuestCheckIn,
  submitGuestRsvp,
} from "./rsvpRepository";

describe("Check-in repository functions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults active check-in event to ceremony and allows updating", async () => {
    expect(await getActiveCheckInEvent()).toBe("ceremony");

    await setActiveCheckInEvent("dinner");
    expect(await getActiveCheckInEvent()).toBe("dinner");

    await setActiveCheckInEvent("ceremony");
    expect(await getActiveCheckInEvent()).toBe("ceremony");
  });

  it("resolves check-in state for an un-RSVPed invite group by password", async () => {
    const group = await createAdminInviteGroup({
      groupName: "Smith Family",
      invitePassword: "smith-pass-123",
      guestNames: ["Alice Smith", "Bob Smith"],
      dinnerGuestNames: ["Alice Smith"],
      ceremonyAllowedCount: 2,
      dinnerAllowedCount: 1,
      notes: "VIP guests",
    });

    const state = await getGuestCheckInState({ invitePassword: "smith-pass-123" });
    expect(state.inviteGroup.id).toBe(group.id);
    expect(state.eventType).toBe("ceremony");
    expect(state.hasRsvp).toBe(false);
    expect(state.attendees).toEqual([
      { name: "Alice Smith", checkedIn: false },
      { name: "Bob Smith", checkedIn: false },
    ]);
    expect(state.checkedInNames).toEqual([]);
  });

  it("prioritizes confirmed RSVP attending guests when available", async () => {
    const group = await createAdminInviteGroup({
      groupName: "Tan Family",
      invitePassword: "tan-pass-456",
      guestNames: ["Charlie Tan", "Diana Tan"],
      dinnerGuestNames: ["Charlie Tan", "Diana Tan"],
      ceremonyAllowedCount: 2,
      dinnerAllowedCount: 2,
      notes: "",
    });

    // Only Charlie RSVPs as attending ceremony
    await submitGuestRsvp({
      inviteGroupId: group.id,
      responderName: "Charlie Tan",
      ceremonyAttendingCount: 1,
      dinnerAttendingCount: 2,
      generalNotes: "",
      ceremonyAttendees: [
        { attendeeIndex: 0, attendeeLabel: "Charlie Tan", dietaryPreference: "" },
      ],
      dinnerAttendees: [
        { attendeeIndex: 0, attendeeLabel: "Charlie Tan", mealOption: "Option 1", dietaryPreference: "" },
        { attendeeIndex: 1, attendeeLabel: "Diana Tan", mealOption: "Option 2", dietaryPreference: "" },
      ],
    });

    const ceremonyState = await getGuestCheckInState({ invitePassword: "tan-pass-456" });
    expect(ceremonyState.hasRsvp).toBe(true);
    expect(ceremonyState.attendees).toEqual([
      { name: "Charlie Tan", checkedIn: false },
    ]);

    await setActiveCheckInEvent("dinner");
    const dinnerState = await getGuestCheckInState({ inviteGroupId: group.id });
    expect(dinnerState.eventType).toBe("dinner");
    expect(dinnerState.attendees).toEqual([
      { name: "Charlie Tan", checkedIn: false },
      { name: "Diana Tan", checkedIn: false },
    ]);
  });

  it("submits and updates check-in attendees, allowing edits", async () => {
    const group = await createAdminInviteGroup({
      groupName: "Lee Family",
      invitePassword: "lee-pass-789",
      guestNames: ["Eve Lee", "Frank Lee"],
      dinnerGuestNames: [],
      ceremonyAllowedCount: 2,
      dinnerAllowedCount: 0,
      notes: "",
    });

    // Eve arrives first
    await submitGuestCheckIn({
      inviteGroupId: group.id,
      eventType: "ceremony",
      checkedInNames: ["Eve Lee"],
    });

    let state = await getGuestCheckInState({ invitePassword: "lee-pass-789" });
    expect(state.checkedInNames).toEqual(["Eve Lee"]);
    expect(state.attendees).toEqual([
      { name: "Eve Lee", checkedIn: true },
      { name: "Frank Lee", checkedIn: false },
    ]);

    // Frank arrives later or an edit is made
    await submitGuestCheckIn({
      inviteGroupId: group.id,
      eventType: "ceremony",
      checkedInNames: ["Eve Lee", "Frank Lee"],
    });

    state = await getGuestCheckInState({ inviteGroupId: group.id });
    expect(state.checkedInNames).toEqual(["Eve Lee", "Frank Lee"]);
    expect(state.attendees).toEqual([
      { name: "Eve Lee", checkedIn: true },
      { name: "Frank Lee", checkedIn: true },
    ]);

    // Accidental check-in correction: uncheck Frank
    await submitGuestCheckIn({
      inviteGroupId: group.id,
      eventType: "ceremony",
      checkedInNames: ["Eve Lee"],
    });

    state = await getGuestCheckInState({ inviteGroupId: group.id });
    expect(state.checkedInNames).toEqual(["Eve Lee"]);
    expect(state.attendees).toEqual([
      { name: "Eve Lee", checkedIn: true },
      { name: "Frank Lee", checkedIn: false },
    ]);
  });
});
