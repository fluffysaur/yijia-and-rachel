import type { NewInviteGuestRow } from "./types";

export function createNewInviteGuestRow(): NewInviteGuestRow {
    return {
        id: crypto.randomUUID(),
        fullName: "",
        church: true,
        dinner: false,
        remarks: "",
    };
}
