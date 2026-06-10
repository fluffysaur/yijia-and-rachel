import type { EventDetails } from "../types/wedding";

const compactDateTime = (date: string, time: string) => `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;

const encodeGoogleDateTime = (event: EventDetails) =>
  `${compactDateTime(event.date, event.startTime)}/${compactDateTime(event.date, event.endTime)}`;

export function googleCalendarUrl(event: EventDetails) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: encodeGoogleDateTime(event),
    details: `${event.description}\n\nAttire: ${event.attire}`,
    location: `${event.venueName}, ${event.address}`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsCalendarDataUrl(event: EventDetails) {
  const uid = `${event.id}-${event.date}@yijiaxrachel`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yi Jia and Rachel Wedding//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${compactDateTime(event.date, event.startTime)}`,
    `DTSTART:${compactDateTime(event.date, event.startTime)}`,
    `DTEND:${compactDateTime(event.date, event.endTime)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description} Attire: ${event.attire}`,
    `LOCATION:${event.venueName}, ${event.address}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  return `data:text/calendar;charset=utf8,${encodeURIComponent(lines.join("\r\n"))}`;
}
