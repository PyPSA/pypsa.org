// Wave metadata free of the questionnaire so the banner, pill, pre-paint script, privacy page and Worker can import it.
export interface WaveMeta {
  wave: string;
  version: number;
  title: string;
  /** ISO 8601 with offset. */
  opens: string;
  /** ISO 8601 with offset, exclusive. */
  closes: string;
  contact: string;
  retention: string;
  /** `{closes}` in `full` is replaced by the last open day. */
  banner: { full: string; short: string; cta: string };
  pill: string;
}

/** Production hosts. Any other host (previews, localhost) ignores the dates so the survey can be tested. */
export const LIVE_HOST = /^(www\.)?pypsa\.org$/;

/** True from `opens` (inclusive) until `closes` (exclusive). */
export function isOpen(meta: Pick<WaveMeta, "opens" | "closes">, now: Date): boolean {
  const t = now.getTime();
  return t >= Date.parse(meta.opens) && t < Date.parse(meta.closes);
}
