import type { InviteGroup, RsvpDraft, RsvpValidationResult } from "../types/rsvp";
import { dinnerMealOptions } from "../types/rsvp";

const countMatchesRows = (count: number, rowLength: number) => count === rowLength;

export function validateRsvpDraft(inviteGroup: InviteGroup, draft: RsvpDraft): RsvpValidationResult {
  const errors: string[] = [];

  if (!draft.responderName.trim()) {
    errors.push("Please enter the name of the person submitting this RSVP.");
  }

  if (draft.ceremonyAttendingCount < 0 || draft.ceremonyAttendingCount > inviteGroup.ceremonyAllowedCount) {
    errors.push(`Church ceremony count must be between 0 and ${inviteGroup.ceremonyAllowedCount}.`);
  }

  if (!countMatchesRows(draft.ceremonyAttendingCount, draft.ceremonyAttendees.length)) {
    errors.push("Church ceremony attendee dietary rows must match the church ceremony attendance count.");
  }

  if (draft.dinnerAttendingCount < 0 || draft.dinnerAttendingCount > inviteGroup.dinnerAllowedCount) {
    errors.push(`Dinner count must be between 0 and ${inviteGroup.dinnerAllowedCount}.`);
  }

  if (inviteGroup.dinnerAllowedCount === 0 && draft.dinnerAttendingCount > 0) {
    errors.push("This invite group is not invited for the dinner banquet.");
  }

  if (!countMatchesRows(draft.dinnerAttendingCount, draft.dinnerAttendees.length)) {
    errors.push("Dinner attendee meal rows must match the dinner attendance count.");
  }

  draft.dinnerAttendees.forEach((attendee, index) => {
    if (!dinnerMealOptions.includes(attendee.mealOption)) {
      errors.push(`Dinner attendee ${index + 1} needs a valid meal selection.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export function isGuestReadOnly(hasSubmitted: boolean) {
  return hasSubmitted;
}
