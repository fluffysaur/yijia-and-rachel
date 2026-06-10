import { describe, expect, it } from "vitest";
import { siteContent } from "../content/wedding";
import { googleCalendarUrl, icsCalendarDataUrl } from "./calendar";

describe("calendar helpers", () => {
  it("generates Google Calendar links", () => {
    const url = googleCalendarUrl(siteContent.events[0]);

    expect(url).toContain("calendar.google.com");
    expect(url).toContain("20270619T110000%2F20270619T140000");
  });

  it("generates ICS data URLs", () => {
    const url = icsCalendarDataUrl(siteContent.events[0]);

    expect(url).toContain("data:text/calendar");
    expect(decodeURIComponent(url)).toContain("BEGIN:VEVENT");
  });
});
