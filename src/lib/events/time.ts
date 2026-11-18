import type { EventData } from "$lib/data/events";

export type EventTimeInput = Pick<EventData, "date" | "endDate" | "time" | "timezones">;

export interface EventTime {
  formattedDate: string;
  formattedTime: string;
  heroTimezones: { label: string; time: string }[];
  calendar: { month: string; days: string; weekday: string | null; year: number };
}

const HERO_REF_CITIES = ["New York", "New Delhi"];
const TIME_RE = /(\d{1,2}):(\d{2})\s*(am|pm)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(am|pm)\s*\((\w+)\)/i;
const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit" });

function parseUtcOffset(tz: string): number {
  const match = tz.match(/UTC([+-]?\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

function parseTime(t: string): { hours: number; minutes: number } {
  const [h, m] = t.split(":").map(Number);
  return { hours: h, minutes: m };
}

function to24h(hours: number, meridiem: string): number {
  const m = meridiem.toLowerCase();
  if (m === "pm" && hours !== 12) return hours + 12;
  if (m === "am" && hours === 12) return 0;
  return hours;
}

function formatClock(day: Date, hours: number, minutes: number): string {
  const d = new Date(day);
  d.setHours(hours, minutes);
  return timeFmt.format(d);
}

function formatDateRange(start: Date, end: Date | null): string {
  if (!end) {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(start);
  }
  // e.g. "6–8 July 2026" (assumes same month/year)
  const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
  return `${start.getDate()}–${end.getDate()} ${monthYear.format(end)}`;
}

function formatTimeRange(day: Date, time: string): string {
  const m = time.match(TIME_RE);
  if (!m) return time;
  const start = formatClock(day, to24h(parseInt(m[1]), m[3]), parseInt(m[2]));
  const end = formatClock(day, to24h(parseInt(m[4]), m[6]), parseInt(m[5]));
  return `${start} – ${end} (${m[7]})`;
}

function heroTimes(day: Date, timezones: EventTimeInput["timezones"]): EventTime["heroTimezones"] {
  const berlinTz = timezones.find((tz) => tz.city === "Berlin");
  const berlinOffset = berlinTz ? parseUtcOffset(berlinTz.timezone) : 2;
  const eventStart = berlinTz ? parseTime(berlinTz.localTime) : { hours: 16, minutes: 0 };

  return HERO_REF_CITIES.flatMap((city) => {
    const tz = timezones.find((t) => t.city === city);
    if (!tz) return [];
    const diff = parseUtcOffset(tz.timezone) - berlinOffset;
    const sMin = eventStart.hours * 60 + eventStart.minutes + diff * 60;
    const hours = Math.floor(sMin / 60);
    return [{ label: tz.city, time: formatClock(day, ((hours % 24) + 24) % 24, sMin % 60) }];
  });
}

/** Display strings for an event's date card, time line and hero reference-city times. */
export function formatEventTime(event: EventTimeInput): EventTime {
  const eventDate = new Date(event.date + "T00:00:00");
  const endDateObj = event.endDate ? new Date(event.endDate + "T00:00:00") : null;

  return {
    formattedDate: formatDateRange(eventDate, endDateObj),
    formattedTime: formatTimeRange(eventDate, event.time),
    heroTimezones: heroTimes(eventDate, event.timezones),
    calendar: {
      month: new Intl.DateTimeFormat("en", { month: "short" }).format(eventDate),
      days: endDateObj
        ? `${eventDate.getDate()}–${endDateObj.getDate()}`
        : `${eventDate.getDate()}`,
      weekday: endDateObj
        ? null
        : new Intl.DateTimeFormat("en", { weekday: "long" }).format(eventDate),
      year: eventDate.getFullYear(),
    },
  };
}
