import type { AdminSummary } from "../../../types/rsvp";

export function AdminMealCounts({ summary }: { summary: AdminSummary }) {
    return (
        <section
            id="meals"
            className="rounded-lg bg-ivory p-5 shadow-sm scroll-mt-24"
        >
            <h2 className="font-display text-3xl">Dinner Meal Counts</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
                {Object.entries(summary.mealCounts).map(([meal, count]) => (
                    <div
                        key={meal}
                        className="rounded-md bg-cream p-3"
                    >
                        <p className="text-small text-taupe">{meal}</p>
                        <p className="font-display text-3xl">{count}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
