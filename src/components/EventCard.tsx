import { CalendarPlus, MapPin } from "lucide-react";
import type { EventDetails } from "../types/wedding";
import { googleCalendarUrl, icsCalendarDataUrl } from "../lib/calendar";
import { LinkButton } from "./Button";

export function EventCard({ event }: { event: EventDetails }) {
    return (
        <article className="reveal relative border border-taupe/20 bg-white p-6 md:p-10 shadow-xs before:pointer-events-none before:absolute before:inset-2 before:border before:border-taupe/10">
            <div className="mb-6">
                <div>
                    <p className="text-label uppercase tracking-[0.24em] text-rose font-medium">
                        {event.id === "ceremony" ? "Morning Celebration" : "Evening Celebration"}
                    </p>
                    <h3 className="mt-2 font-display text-4xl text-ink">{event.title}</h3>
                </div>
            </div>
            <p className="text-ink/80 leading-relaxed">{event.description}</p>
            <dl className="mt-6 grid gap-4 text-small">
                <div>
                    <dt className="font-semibold text-ink">Time</dt>
                    <dd className="text-ink/75 mt-0.5">
                        {event.startTime} - {event.endTime}
                    </dd>
                </div>
                <div>
                    <dt className="font-semibold text-ink">Venue</dt>
                    <dd className="text-ink/75 mt-0.5">{event.venueName}</dd>
                    <dd className="text-ink/75">{event.address}</dd>
                </div>
                <div>
                    <dt className="font-semibold text-ink">Suggested attire</dt>
                    <dd className="text-ink/75 mt-0.5">{event.attire}</dd>
                </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
                <LinkButton
                    href={googleCalendarUrl(event)}
                    variant="primary"
                    target="_blank"
                    rel="noreferrer"
                >
                    <CalendarPlus size={16} />
                    Add to Google Calendar
                </LinkButton>
                <LinkButton
                    href={icsCalendarDataUrl(event)}
                    variant="secondary"
                    download={`${event.id}.ics`}
                >
                    <CalendarPlus size={16} />
                    Add to other calendar
                </LinkButton>
                <LinkButton
                    href={event.mapUrl}
                    variant="secondary"
                    target="_blank"
                    rel="noreferrer"
                >
                    <MapPin size={16} />
                    Directions
                </LinkButton>
            </div>
            <div className="mt-8 overflow-hidden border border-taupe/15 bg-cream">
                <iframe
                    title={`${event.title} map`}
                    src={event.mapEmbedUrl}
                    className="h-72 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                />
            </div>
        </article>
    );
}
