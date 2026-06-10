import { EventCard } from "../../EventCard";
import { siteContent } from "../../../content/wedding";
import { useAuth } from "../../auth/AuthContext";
import { filterEventsForRole } from "../../../lib/access";

export function HomeEventsSection() {
    const { role } = useAuth();
    const events = filterEventsForRole(siteContent.events, role);

    return (
        <section
            id="events"
            className="bg-cream/35 py-20"
        >
            <div className="section-shell">
                <div className="reveal mb-10 max-w-2xl">
                    <p className="text-sm uppercase text-rose">The day</p>
                    <h2 className="mt-2 font-display text-5xl">Wedding Details</h2>
                    <p className="mt-4 text-taupe">
                        Church ceremony and lunch RSVP is open to all invited attendees. Dinner banquet RSVP appears
                        only for invite groups invited to dinner.
                    </p>
                </div>
                <div className="grid gap-8">
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
