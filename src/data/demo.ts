import type { InviteGroup, RsvpResponse } from "../types/rsvp";

const submittedAt = new Date("2026-01-01T10:00:00.000Z").toISOString();

export const demoInviteGroups: InviteGroup[] = [
  {
    id: "demo-family-tan",
    groupName: "Tan Family",
    guestNames: ["Daniel Tan", "Grace Tan", "Ethan Tan", "Emma Tan"],
    dinnerGuestNames: ["Daniel Tan", "Grace Tan"],
    ceremonyAllowedCount: 4,
    dinnerAllowedCount: 2,
    notes: "Partial dinner invite, pending RSVP"
  },
  {
    id: "demo-lee-and-partner",
    groupName: "Lee and Partner",
    guestNames: ["Marcus Lee", "Samantha Koh"],
    dinnerGuestNames: [],
    ceremonyAllowedCount: 2,
    dinnerAllowedCount: 0,
    notes: "Church ceremony and lunch only, pending RSVP"
  },
  {
    id: "demo-ong-family",
    groupName: "Ong Family",
    guestNames: ["Andrew Ong", "Melissa Ong", "Noah Ong", "Chloe Ong", "Sarah Ong"],
    dinnerGuestNames: ["Andrew Ong", "Melissa Ong", "Noah Ong", "Chloe Ong", "Sarah Ong"],
    ceremonyAllowedCount: 5,
    dinnerAllowedCount: 5,
    notes: "Submitted partial attendance with mixed meal choices"
  },
  {
    id: "demo-chen-parents",
    groupName: "Chen Parents",
    guestNames: ["Robert Chen", "Lily Chen"],
    dinnerGuestNames: ["Robert Chen", "Lily Chen"],
    ceremonyAllowedCount: 2,
    dinnerAllowedCount: 2,
    notes: "Submitted full attendance"
  },
  {
    id: "demo-wong-family",
    groupName: "Wong Family",
    guestNames: ["Isaac Wong", "Rachel Wong", "Mia Wong", "Lucas Wong", "Ava Wong", "Jonah Wong"],
    dinnerGuestNames: ["Isaac Wong", "Rachel Wong", "Mia Wong", "Lucas Wong"],
    ceremonyAllowedCount: 6,
    dinnerAllowedCount: 4,
    notes: "Large family, partial dinner invite"
  },
  {
    id: "demo-nur-and-aziz",
    groupName: "Nur and Aziz",
    guestNames: ["Nur Aisyah", "Aziz Rahman"],
    dinnerGuestNames: ["Nur Aisyah", "Aziz Rahman"],
    ceremonyAllowedCount: 2,
    dinnerAllowedCount: 2,
    notes: "Submitted halal meals"
  },
  {
    id: "demo-priya-family",
    groupName: "Priya Family",
    guestNames: ["Priya Nair", "Arjun Nair", "Meera Nair"],
    dinnerGuestNames: ["Priya Nair", "Arjun Nair", "Meera Nair"],
    ceremonyAllowedCount: 3,
    dinnerAllowedCount: 3,
    notes: "Submitted vegetarian meals"
  },
  {
    id: "demo-goh-colleagues",
    groupName: "Goh Colleagues",
    guestNames: ["Benjamin Goh", "Clara Lim", "Darren Foo", "Elaine Seah"],
    dinnerGuestNames: [],
    ceremonyAllowedCount: 4,
    dinnerAllowedCount: 0,
    notes: "Church-only group with submitted decline"
  },
  {
    id: "demo-single-jasmine",
    groupName: "Jasmine Teo",
    guestNames: ["Jasmine Teo"],
    dinnerGuestNames: ["Jasmine Teo"],
    ceremonyAllowedCount: 1,
    dinnerAllowedCount: 1,
    notes: "Single guest, pending RSVP"
  },
  {
    id: "demo-grandparents-lim",
    groupName: "Grandparents Lim",
    guestNames: ["Ah Gong Lim", "Ah Ma Lim"],
    dinnerGuestNames: ["Ah Gong Lim", "Ah Ma Lim"],
    ceremonyAllowedCount: 2,
    dinnerAllowedCount: 2,
    notes: "Submitted ceremony only, no dinner attendance"
  },
  {
    id: "demo-youth-group",
    groupName: "Youth Group",
    guestNames: ["Caleb Low", "Phoebe Chua", "Ryan Yeo", "Tessa Ng", "Zachary Sim"],
    dinnerGuestNames: ["Caleb Low", "Phoebe Chua"],
    ceremonyAllowedCount: 5,
    dinnerAllowedCount: 2,
    notes: "Mixed pending group for search and admin testing"
  },
  {
    id: "demo-overseas-friends",
    groupName: "Overseas Friends",
    guestNames: ["Hannah Park", "Min Jae Kim", "Sophie Tan"],
    dinnerGuestNames: ["Hannah Park", "Min Jae Kim", "Sophie Tan"],
    ceremonyAllowedCount: 3,
    dinnerAllowedCount: 3,
    notes: "Submitted all unable to attend"
  }
];

export const demoResponses: RsvpResponse[] = [
  {
    id: "demo-rsvp-ong",
    inviteGroupId: "demo-ong-family",
    responderName: "Melissa Ong",
    ceremonyAttendingCount: 3,
    dinnerAttendingCount: 4,
    generalNotes: "Chloe and Sarah cannot attend the ceremony, but Chloe will join dinner.",
    lockedForGuestEdit: true,
    submittedAt,
    updatedAt: submittedAt,
    ceremonyAttendees: [
      { attendeeIndex: 1, attendeeLabel: "Andrew Ong", dietaryPreference: "No beef" },
      { attendeeIndex: 2, attendeeLabel: "Melissa Ong", dietaryPreference: "" },
      { attendeeIndex: 3, attendeeLabel: "Noah Ong", dietaryPreference: "Vegetarian preferred" }
    ],
    dinnerAttendees: [
      { attendeeIndex: 1, attendeeLabel: "Andrew Ong", mealOption: "Option 1", dietaryPreference: "No beef" },
      { attendeeIndex: 2, attendeeLabel: "Melissa Ong", mealOption: "Option 2", dietaryPreference: "" },
      { attendeeIndex: 3, attendeeLabel: "Noah Ong", mealOption: "Vegetarian", dietaryPreference: "" },
      { attendeeIndex: 4, attendeeLabel: "Chloe Ong", mealOption: "Option 1", dietaryPreference: "No shellfish" }
    ]
  },
  {
    id: "demo-rsvp-chen",
    inviteGroupId: "demo-chen-parents",
    responderName: "Robert Chen",
    ceremonyAttendingCount: 2,
    dinnerAttendingCount: 2,
    generalNotes: "Please seat us with family if possible.",
    lockedForGuestEdit: true,
    submittedAt,
    updatedAt: submittedAt,
    ceremonyAttendees: [
      { attendeeIndex: 1, attendeeLabel: "Robert Chen", dietaryPreference: "Less spicy" },
      { attendeeIndex: 2, attendeeLabel: "Lily Chen", dietaryPreference: "" }
    ],
    dinnerAttendees: [
      { attendeeIndex: 1, attendeeLabel: "Robert Chen", mealOption: "Option 1", dietaryPreference: "Less spicy" },
      { attendeeIndex: 2, attendeeLabel: "Lily Chen", mealOption: "Option 2", dietaryPreference: "" }
    ]
  },
  {
    id: "demo-rsvp-nur-aziz",
    inviteGroupId: "demo-nur-and-aziz",
    responderName: "Nur Aisyah",
    ceremonyAttendingCount: 2,
    dinnerAttendingCount: 2,
    generalNotes: "Halal meals requested.",
    lockedForGuestEdit: true,
    submittedAt,
    updatedAt: submittedAt,
    ceremonyAttendees: [
      { attendeeIndex: 1, attendeeLabel: "Nur Aisyah", dietaryPreference: "Halal" },
      { attendeeIndex: 2, attendeeLabel: "Aziz Rahman", dietaryPreference: "Halal" }
    ],
    dinnerAttendees: [
      { attendeeIndex: 1, attendeeLabel: "Nur Aisyah", mealOption: "Halal", dietaryPreference: "" },
      { attendeeIndex: 2, attendeeLabel: "Aziz Rahman", mealOption: "Halal", dietaryPreference: "No peanuts" }
    ]
  },
  {
    id: "demo-rsvp-priya",
    inviteGroupId: "demo-priya-family",
    responderName: "Priya Nair",
    ceremonyAttendingCount: 3,
    dinnerAttendingCount: 3,
    generalNotes: "All vegetarian.",
    lockedForGuestEdit: true,
    submittedAt,
    updatedAt: submittedAt,
    ceremonyAttendees: [
      { attendeeIndex: 1, attendeeLabel: "Priya Nair", dietaryPreference: "Vegetarian" },
      { attendeeIndex: 2, attendeeLabel: "Arjun Nair", dietaryPreference: "Vegetarian" },
      { attendeeIndex: 3, attendeeLabel: "Meera Nair", dietaryPreference: "Vegetarian, no mushrooms" }
    ],
    dinnerAttendees: [
      { attendeeIndex: 1, attendeeLabel: "Priya Nair", mealOption: "Vegetarian", dietaryPreference: "" },
      { attendeeIndex: 2, attendeeLabel: "Arjun Nair", mealOption: "Vegetarian", dietaryPreference: "" },
      { attendeeIndex: 3, attendeeLabel: "Meera Nair", mealOption: "Vegetarian", dietaryPreference: "No mushrooms" }
    ]
  },
  {
    id: "demo-rsvp-goh-colleagues",
    inviteGroupId: "demo-goh-colleagues",
    responderName: "Benjamin Goh",
    ceremonyAttendingCount: 0,
    dinnerAttendingCount: 0,
    generalNotes: "The team is unable to attend, but sends their best wishes.",
    lockedForGuestEdit: true,
    submittedAt,
    updatedAt: submittedAt,
    ceremonyAttendees: [],
    dinnerAttendees: []
  },
  {
    id: "demo-rsvp-grandparents-lim",
    inviteGroupId: "demo-grandparents-lim",
    responderName: "Ah Ma Lim",
    ceremonyAttendingCount: 2,
    dinnerAttendingCount: 0,
    generalNotes: "Attending church and lunch only.",
    lockedForGuestEdit: true,
    submittedAt,
    updatedAt: submittedAt,
    ceremonyAttendees: [
      { attendeeIndex: 1, attendeeLabel: "Ah Gong Lim", dietaryPreference: "Soft food preferred" },
      { attendeeIndex: 2, attendeeLabel: "Ah Ma Lim", dietaryPreference: "No prawns" }
    ],
    dinnerAttendees: []
  },
  {
    id: "demo-rsvp-overseas-friends",
    inviteGroupId: "demo-overseas-friends",
    responderName: "Hannah Park",
    ceremonyAttendingCount: 0,
    dinnerAttendingCount: 0,
    generalNotes: "Unable to travel for the wedding.",
    lockedForGuestEdit: true,
    submittedAt,
    updatedAt: submittedAt,
    ceremonyAttendees: [],
    dinnerAttendees: []
  }
];
