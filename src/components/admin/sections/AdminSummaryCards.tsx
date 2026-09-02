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
                ["Arrived", churchCheckedIn],
            ],
        },
        {
            title: "Dinner",
            stats: [
                ["Invited", summary.dinnerInvited],
                ["RSVPed", summary.dinnerAttending],
                ["Arrived", dinnerCheckedIn],
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
                    className="relative rounded-xs border border-taupe/15 bg-white/95 p-6 shadow-xs before:pointer-events-none before:absolute before:inset-2 before:border before:border-taupe/10"
                >
                    <h2 className="font-display text-2xl text-ink">{group.title}</h2>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        {group.stats.map(([label, value]) => (
                            <div
                                key={label}
                                className="rounded-xs border border-taupe/15 bg-cream/30 p-3"
                            >
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-taupe whitespace-nowrap">{label}</p>
                                <p className="mt-2 font-display text-3xl text-ink">{value}</p>
                            </div>
                        ))}
                    </div>
                </article>
            ))}
        </section>
    );
}
