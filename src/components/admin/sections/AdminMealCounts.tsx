import type { AdminSummary } from "../../../types/rsvp";

export function AdminMealCounts({ summary }: { summary: AdminSummary }) {
    return (
        <section
            id="meals"
            className="relative rounded-xs border border-taupe/15 bg-white/95 p-6 shadow-xs scroll-mt-24 before:pointer-events-none before:absolute before:inset-2 before:border before:border-taupe/10"
        >
            <h2 className="font-display text-3xl text-ink">Dinner Meal Counts</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {Object.entries(summary.mealCounts).map(([meal, count]) => (
                    <div
                        key={meal}
                        className="rounded-xs border border-taupe/15 bg-cream/30 p-3"
                    >
                        <p className="text-sm font-medium text-ink">{meal}</p>
                        <p className="mt-1 font-display text-3xl text-ink">{count}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
