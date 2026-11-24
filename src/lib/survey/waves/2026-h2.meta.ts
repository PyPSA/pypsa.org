// Metadata of the 2026-h2 wave, free of the questionnaire so every page may import it.
import type { WaveMeta } from "../meta";

export const meta2026H2: WaveMeta = {
  wave: "2026-h2",
  version: 1,
  title: "PyPSA User Survey 2026",
  opens: "2026-11-25T00:00:00+01:00",
  closes: "2026-12-14T00:00:00+01:00",
  contact: "contact@pypsa.org",
  retention:
    "raw responses are deleted 12 months after the survey closes, aggregated results are kept.",
  banner: {
    full: "PyPSA User Survey 2026: help us decide what to build next. 10 to 15 minutes, open until {closes}.",
    short: "User survey 2026",
    cta: "Take it",
  },
  pill: "PyPSA User Survey 2026: 10 to 15 minutes to shape our roadmap",
};
