// Date helpers shared by the survey page, banner and markdown export; free of survey-core.
const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

/** Formats an ISO instant as a calendar day in Europe/Berlin, e.g. "13 December 2026". */
export const formatDay = (iso: string | number | Date): string => dayFormat.format(new Date(iso));

/** The last day the survey is open: `closes` is exclusive, so the day before it starts. */
export const lastOpenDay = (closes: string): string => formatDay(Date.parse(closes) - 1);
