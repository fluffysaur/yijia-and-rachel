export const dinnerMealOptions = ["Option 1", "Option 2", "Halal", "Vegetarian"] as const;

export type DinnerMealOption = (typeof dinnerMealOptions)[number];

export type InviteGroup = {
  id: string;
  groupName: string;
  invitePassword?: string | null;
  guestNames: string[];
  dinnerGuestNames: string[];
  ceremonyAllowedCount: number;
  dinnerAllowedCount: number;
  notes?: string | null;
  hasSubmitted?: boolean;
};

export type CeremonyAttendee = {
  attendeeIndex: number;
  attendeeLabel: string;
  dietaryPreference: string;
};

export type DinnerAttendee = {
  attendeeIndex: number;
  attendeeLabel: string;
  mealOption: DinnerMealOption;
  dietaryPreference: string;
};

export type RsvpResponse = {
  id: string;
  inviteGroupId: string;
  responderName: string;
  ceremonyAttendingCount: number;
  dinnerAttendingCount: number;
  generalNotes: string;
  lockedForGuestEdit: boolean;
  submittedAt: string;
  updatedAt: string;
  ceremonyAttendees: CeremonyAttendee[];
  dinnerAttendees: DinnerAttendee[];
};

export type RsvpDraft = {
  inviteGroupId: string;
  responderName: string;
  ceremonyAttendingCount: number;
  dinnerAttendingCount: number;
  generalNotes: string;
  ceremonyAttendees: CeremonyAttendee[];
  dinnerAttendees: DinnerAttendee[];
};

export type RsvpValidationResult = {
  valid: boolean;
  errors: string[];
};

export type InviteWithRsvp = {
  inviteGroup: InviteGroup;
  rsvp: RsvpResponse | null;
};

export type AdminSummary = {
  totalInviteGroups: number;
  ceremonyInvited: number;
  ceremonyAttending: number;
  dinnerInvited: number;
  dinnerAttending: number;
  pendingResponses: number;
  mealCounts: Record<DinnerMealOption, number>;
};
