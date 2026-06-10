import type { AdminSummary } from "../../../types/rsvp";

export function AdminSummaryCards({ summary }: { summary: AdminSummary }) {
    return (
        <section
            id="summary"
            className="grid gap-4 scroll-mt-24 md:grid-cols-3 lg:grid-cols-6"
        >
            {[
                ["Invite groups", summary.totalInviteGroups],
                ["Church invited", summary.ceremonyInvited],
                ["Church attending", summary.ceremonyAttending],
                ["Dinner invited", summary.dinnerInvited],
                ["Dinner attending", summary.dinnerAttending],
                ["Pending", summary.pendingResponses],
            ].map(([label, value]) => (
                <article
                    key={label}
                    className="rounded-lg bg-ivory p-4 shadow-sm"
                >
                    <p className="text-sm text-taupe">{label}</p>
                    <p className="mt-2 font-display text-4xl">{value}</p>
                </article>
            ))}
        </section>
    );
}
