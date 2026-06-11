import { siteContent } from "../content/wedding";
import type { InviteGroup, InviteMessageTemplates } from "../types/rsvp";
import type { EventDetails } from "../types/wedding";

export const defaultInviteMessageTemplates: InviteMessageTemplates = {
  lunchTemplate: [
    "Dear {groupName}, you are invited to our wedding ceremony and lunch!",
    "",
    "{lunchDetails}",
    "",
    "Please RSVP on our wedding site by {rsvpDeadline}:",
    "{siteUrl}",
    "",
    "Your wedding site password is: {password}",
    "",
    "Please reply here if you have any questions."
  ].join("\n"),
  dinnerTemplate: [
    "Dear {groupName}, you are invited to our wedding ceremony, lunch, and dinner banquet!",
    "",
    "{eventDetails}",
    "",
    "Please RSVP on our wedding site by {rsvpDeadline}:",
    "{siteUrl}",
    "",
    "Your wedding site password is: {password}",
    "",
    "Please reply here if you have any questions."
  ].join("\n")
};

export function hasDinnerInvite(invite: Pick<InviteGroup, "dinnerAllowedCount" | "dinnerGuestNames">) {
  return invite.dinnerAllowedCount > 0 || invite.dinnerGuestNames.length > 0;
}

function findEvent(eventId: EventDetails["id"]) {
  return siteContent.events.find((event) => event.id === eventId);
}

function formatEventDetails(event: EventDetails | undefined) {
  if (!event) return "Details TBC";

  return [
    event.title,
    `${siteContent.couple.dateLabel}, ${event.startTime} - ${event.endTime}`,
    event.venueName,
    event.address
  ].join("\n");
}

export function formatRsvpDeadline(value: string | null) {
  if (!value) return "TBC";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBC";

  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

export function buildInviteMessage(input: {
  invite: InviteGroup;
  templates: InviteMessageTemplates;
  siteUrl: string;
  rsvpDeadline: string | null;
}) {
  const lunchDetails = formatEventDetails(findEvent("ceremony"));
  const dinnerDetails = hasDinnerInvite(input.invite) ? formatEventDetails(findEvent("dinner")) : "";
  const eventDetails = [lunchDetails, dinnerDetails].filter(Boolean).join("\n\n");
  const template = hasDinnerInvite(input.invite) ? input.templates.dinnerTemplate : input.templates.lunchTemplate;
  const replacements: Record<string, string> = {
    groupName: input.invite.groupName,
    password: input.invite.invitePassword?.trim() || "TBC",
    siteUrl: input.siteUrl,
    rsvpDeadline: formatRsvpDeadline(input.rsvpDeadline),
    lunchDetails,
    dinnerDetails,
    eventDetails
  };

  return Object.entries(replacements).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, value),
    template
  );
}
