import type { EventData } from "$lib/data/events";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const formatDate = (d: string) => dateFmt.format(new Date(d + "T00:00:00Z"));

export const dateRange = (e: Pick<EventData, "date" | "endDate">) =>
  e.endDate ? `${formatDate(e.date)} to ${formatDate(e.endDate)}` : formatDate(e.date);
