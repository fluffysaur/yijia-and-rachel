import { describe, expect, it } from "vitest";
import { buildInviteMessage, defaultInviteMessageTemplates } from "./inviteMessage";
import type { InviteGroup } from "../types/rsvp";

const baseInvite: InviteGroup = {
  id: "invite-1",
  groupName: "Tan Family",
  invitePassword: "rose-gold-1234",
  guestNames: ["Daniel Tan", "Grace Tan"],
  dinnerGuestNames: [],
  ceremonyAllowedCount: 2,
  dinnerAllowedCount: 0,
  notes: null
};

describe("invite message generator", () => {
  it("omits dinner details for lunch-only groups", () => {
    const message = buildInviteMessage({
      invite: baseInvite,
      templates: defaultInviteMessageTemplates,
      siteUrl: "https://wedding.test",
      rsvpDeadline: "2027-05-01T10:00:00.000Z"
    });

    expect(message).toContain("Dear Tan Family");
    expect(message).toContain("Church Wedding Ceremony & Lunch Buffet");
    expect(message).not.toContain("Dinner Banquet");
  });

  it("includes dinner details for dinner-invited groups", () => {
    const message = buildInviteMessage({
      invite: {
        ...baseInvite,
        dinnerGuestNames: ["Daniel Tan"],
        dinnerAllowedCount: 1
      },
      templates: defaultInviteMessageTemplates,
      siteUrl: "https://wedding.test",
      rsvpDeadline: "2027-05-01T10:00:00.000Z"
    });

    expect(message).toContain("Church Wedding Ceremony & Lunch Buffet");
    expect(message).toContain("Dinner Banquet");
  });

  it("replaces placeholders and uses TBC for missing deadline", () => {
    const message = buildInviteMessage({
      invite: baseInvite,
      templates: {
        lunchTemplate: "{groupName}|{password}|{siteUrl}|{rsvpDeadline}|{lunchDetails}",
        dinnerTemplate: "{eventDetails}"
      },
      siteUrl: "https://wedding.test",
      rsvpDeadline: null
    });

    expect(message).toContain("Tan Family|rose-gold-1234|https://wedding.test|TBC|Church Wedding Ceremony");
    expect(message).not.toContain("{groupName}");
  });
});
