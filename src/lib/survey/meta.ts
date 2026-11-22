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
  /** Names of top-level fields whose values are provisional until launch. */
  placeholders: ("opens" | "retention")[];
  /** `{closes}` in `full` is replaced by the last open day. */
  banner: { full: string; short: string; cta: string };
  pill: string;
}

/** True from `opens` (inclusive) until `closes` (exclusive). */
export function isOpen(meta: Pick<WaveMeta, "opens" | "closes">, now: Date): boolean {
  const t = now.getTime();
  return t >= Date.parse(meta.opens) && t < Date.parse(meta.closes);
}
