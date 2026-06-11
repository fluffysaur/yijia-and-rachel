import type { AdminSummary } from "../../../types/rsvp";

export function AdminSummaryCards({
    summary,
    churchCheckedIn,
    dinnerCheckedIn,
}: {
    summary: AdminSummary;
    churchCheckedIn: number;
    dinnerCheckedIn: number;
}) {
    const rsvpedGroups = summary.totalInviteGroups - summary.pendingResponses;
    const groups = [
        {
            title: "Invite Groups",
            stats: [
                ["Groups", summary.totalInviteGroups],
                ["RSVPed", rsvpedGroups],
                ["Pending", summary.pendingResponses],
            ],
        },
        {
            title: "Church",
            stats: [
                ["Invited", summary.ceremonyInvited],
                ["RSVPed", summary.ceremonyAttending],
                ["Checked in", churchCheckedIn],
            ],
        },
        {
            title: "Dinner",
            stats: [
                ["Invited", summary.dinnerInvited],
                ["RSVPed", summary.dinnerAttending],
                ["Checked in", dinnerCheckedIn],
            ],
        },
    ];

    return (
        <section
            id="summary"
            className="grid gap-4 scroll-mt-24 lg:grid-cols-3"
        >
            {groups.map((group) => (
                <article
                    key={group.title}
                    className="rounded-lg bg-ivory p-5 shadow-sm"
                >
                    <h2 className="font-display text-2xl">{group.title}</h2>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        {group.stats.map(([label, value]) => (
                            <div
                                key={label}
                                className="rounded-md bg-cream p-3"
                            >
                                <p className="text-xs text-taupe">{label}</p>
                                <p className="mt-2 font-display text-3xl">{value}</p>
                            </div>
                        ))}
                    </div>
                </article>
            ))}
        </section>
    );
}
