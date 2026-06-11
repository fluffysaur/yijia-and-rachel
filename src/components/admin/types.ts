import type { InviteGroup, RsvpResponse } from "../../types/rsvp";

export type AdminInviteRow = InviteGroup & { rsvp: RsvpResponse | null };

export type NewInviteGuestRow = {
    id: string;
    fullName: string;
    church: boolean;
    dinner: boolean;
    remarks: string;
};

export type NewInviteFormState = {
    groupName: string;
    invitePassword: string;
    guests: NewInviteGuestRow[];
    notes: string;
};

export type AdminRsvpEditState = AdminInviteRow & {
    rsvpStatus: "submitted" | "pending";
    guests: NewInviteGuestRow[];
};
