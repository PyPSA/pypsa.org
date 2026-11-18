import { describe, expect, it } from "vitest";
import { eventsData } from "$lib/data/events";
import { formatEventTime, type EventTimeInput } from "./time";

const bySlug = (slug: string) => {
  const event = eventsData.find((e) => e.slug === slug);
  if (!event) throw new Error(`missing event ${slug}`);
  return event;
};

const tz = (city: string, timezone: string, localTime = "00:00") => ({
  city,
  timezone,
  localTime,
  date: "",
});

const make = (overrides: Partial<EventTimeInput> = {}): EventTimeInput => ({
  date: "2026-06-29",
  time: "4:00 pm – 6:30 pm (CEST)",
  timezones: [],
  ...overrides,
});

describe("formatEventTime on the current events", () => {
  it("formats the single-day user meeting", () => {
    expect(formatEventTime(bySlug("4th-user-meeting"))).toEqual({
      formattedDate: "Monday, 29 June 2026",
      formattedTime: "16:00 – 18:30 (CEST)",
      heroTimezones: [
        { label: "New York", time: "10:00" },
        { label: "New Delhi", time: "19:30" },
      ],
      calendar: { month: "Jun", days: "29", weekday: "Monday", year: 2026 },
    });
  });

  it("formats the multi-day developer meeting", () => {
    expect(formatEventTime(bySlug("developer-meeting-2026"))).toEqual({
      formattedDate: "6–8 July 2026",
      formattedTime: "All day",
      heroTimezones: [],
      calendar: { month: "Jul", days: "6–8", weekday: null, year: 2026 },
    });
  });
});

describe("time string parsing", () => {
  it("maps 12:00 am to 0:00 and 12:00 pm to 12:00", () => {
    expect(formatEventTime(make({ time: "12:00 am – 12:00 pm (UTC)" })).formattedTime).toBe(
      "0:00 – 12:00 (UTC)"
    );
  });

  it("accepts uppercase meridiems and a hyphen", () => {
    expect(formatEventTime(make({ time: "9:15 AM - 1:05 PM (CET)" })).formattedTime).toBe(
      "9:15 – 13:05 (CET)"
    );
  });

  it("accepts lowercase meridiems and an en dash without spaces", () => {
    expect(formatEventTime(make({ time: "9:15am–1:05pm (CET)" })).formattedTime).toBe(
      "9:15 – 13:05 (CET)"
    );
  });

  it("returns an unmatched time string unchanged", () => {
    expect(formatEventTime(make({ time: "16:00–18:00 CEST" })).formattedTime).toBe(
      "16:00–18:00 CEST"
    );
  });
});

describe("hero timezones", () => {
  it("is empty for an empty timezone list", () => {
    expect(formatEventTime(make({ timezones: [] })).heroTimezones).toEqual([]);
  });

  it("defaults to 16:00 at UTC+2 without a Berlin entry", () => {
    const { heroTimezones } = formatEventTime(
      make({ timezones: [tz("New York", "UTC-4"), tz("New Delhi", "UTC+5.5")] })
    );
    expect(heroTimezones).toEqual([
      { label: "New York", time: "10:00" },
      { label: "New Delhi", time: "19:30" },
    ]);
  });

  it("wraps a negative offset past midnight", () => {
    const { heroTimezones } = formatEventTime(
      make({ timezones: [tz("Berlin", "UTC+2", "03:00"), tz("New York", "UTC-4")] })
    );
    expect(heroTimezones).toEqual([{ label: "New York", time: "21:00" }]);
  });

  it("adds a half-hour offset", () => {
    const { heroTimezones } = formatEventTime(
      make({ timezones: [tz("Berlin", "UTC+2", "20:00"), tz("New Delhi", "UTC+5.5")] })
    );
    expect(heroTimezones).toEqual([{ label: "New Delhi", time: "23:30" }]);
  });

  // Known bug: a negative minute total stays negative in setHours(23, -30) and shows 22:30.
  it.fails("shows 23:30 for a city at UTC+1.5 when Berlin is at 00:00", () => {
    const { heroTimezones } = formatEventTime(
      make({ timezones: [tz("Berlin", "UTC+2", "00:00"), tz("New Delhi", "UTC+1.5")] })
    );
    expect(heroTimezones).toEqual([{ label: "New Delhi", time: "23:30" }]);
  });
});

describe("date range", () => {
  // Known bug: the range assumes one month, so 30 Jun to 2 Jul shows "30–2 July 2026".
  it.fails("names both months for a range across months", () => {
    expect(formatEventTime(make({ date: "2026-06-30", endDate: "2026-07-02" })).formattedDate).toBe(
      "30 June – 2 July 2026"
    );
  });
});
