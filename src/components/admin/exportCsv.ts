import type { AdminInviteRow } from "./types";

export function exportCsv(rows: AdminInviteRow[]) {
    const headers = [
        "group_name",
        "invite_password",
        "invited_at",
        "ceremony_allowed",
        "dinner_allowed",
        "rsvp_submitted",
        "ceremony_attending",
        "dinner_attending",
        "dinner_meals",
        "notes",
    ];
    const body = rows.map((row) =>
        [
            row.groupName,
            row.invitePassword ?? "",
            row.invitedAt ?? "",
            row.ceremonyAllowedCount,
            row.dinnerAllowedCount,
            row.rsvp ? "yes" : "no",
            row.rsvp?.ceremonyAttendingCount ?? 0,
            row.rsvp?.dinnerAttendingCount ?? 0,
            row.rsvp?.dinnerAttendees
                .map((attendee) => `${attendee.attendeeLabel}:${attendee.mealOption}`)
                .join("; ") ?? "",
            row.rsvp?.generalNotes ?? row.notes ?? "",
        ]
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
    );

    const blob = new Blob([[headers.join(","), ...body].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wedding-rsvp-export.csv";
    link.click();
    URL.revokeObjectURL(url);
}
