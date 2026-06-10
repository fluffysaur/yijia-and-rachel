import { CalendarPlus, MapPin } from "lucide-react";
import type { EventDetails } from "../types/wedding";
import { googleCalendarUrl, icsCalendarDataUrl } from "../lib/calendar";
import { LinkButton } from "./Button";

export function EventCard({ event }: { event: EventDetails }) {
    return (
        <article className="reveal rounded-lg border border-taupe/10 bg-white/95 p-5 shadow-[0_24px_80px_rgba(51,43,39,0.07)] md:p-8">
            <div className="mb-4">
                <div>
                    <p className="text-sm uppercase text-rose">{event.id === "ceremony" ? "Morning" : "Evening"}</p>
                    <h3 className="mt-1 font-display text-3xl text-ink">{event.title}</h3>
                </div>
            </div>
            <p className="text-taupe">{event.description}</p>
            <dl className="mt-5 grid gap-3 text-sm">
                <div>
                    <dt className="font-medium text-ink">Time</dt>
                    <dd className="text-taupe">
                        {event.startTime} - {event.endTime}
                    </dd>
                </div>
                <div>
                    <dt className="font-medium text-ink">Venue</dt>
                    <dd className="text-taupe">{event.venueName}</dd>
                    <dd className="text-taupe">{event.address}</dd>
                </div>
                <div>
                    <dt className="font-medium text-ink">Suggested attire</dt>
                    <dd className="text-taupe">{event.attire}</dd>
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
            <div className="mt-7 overflow-hidden rounded-lg border border-taupe/10 bg-cream shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]">
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
