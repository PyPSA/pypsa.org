// Pure wave helpers shared by the browser and the Worker, so never import survey-core.
import wave2026H2 from "./waves/2026-h2.json";

/** Name of the hidden honeypot field. Added to the model at runtime, not in the definition. */
export const HONEYPOT = "website";

export interface WelcomeSegment {
  text: string;
  /** Present when the segment is a link. */
  href?: string;
}

export interface SurveyElementJson {
  type: string;
  name: string;
  title?: string;
  description?: string;
  visibleIf?: string;
  elements?: SurveyElementJson[];
  showOtherItem?: boolean;
  showCommentArea?: boolean;
  /** A `showCommentArea` choice stores its comment inside the checkbox value as `{ value, comment }`, so validation accepts both shapes. */
  choices?: { value: string; text: string; description?: string; showCommentArea?: boolean }[];
  rows?: { value: string; text: string; description?: string }[];
  columns?: { value?: string; text?: string; title?: string }[];
  [key: string]: unknown;
}

export interface SurveyPageJson {
  name: string;
  title?: string;
  description?: string;
  visibleIf?: string;
  elements: SurveyElementJson[];
}

export interface WaveSection {
  /** Stable id of the Part 3 section, sent in `section_order`. */
  id: string;
  /** Name of the SurveyJS page that holds the section. */
  page: string;
  title: string;
}

export interface WaveDefinition {
  wave: string;
  version: number;
  /** ISO 8601 with offset. */
  opens: string;
  closes: string;
  contact: string;
  retention: string;
  /** Names of top-level fields whose values are provisional until launch. */
  placeholders: ("opens" | "retention")[];
  welcome: {
    title: string;
    intro: string[];
    bullets: WelcomeSegment[][];
    support: string;
    contactLine: string;
    startLabel: string;
  };
  part3: { title: string; intro: string; howItWorks: string; scaleQuestion: string };
  nonUser: { q2_1Title: string };
  thankYou: { text: string; shareLabel: string; shareUrl: string; copyLabel: string };
  sections: WaveSection[];
  /** Log-scaled slider settings by question name, the single source for min, max and scale. */
  sliders: Record<string, { min: number; max: number; scale: "log"; orMore: boolean }>;
  /** SurveyJS JSON. */
  survey: { pages: SurveyPageJson[]; [key: string]: unknown };
}

export const waves: Record<string, WaveDefinition> = {
  [wave2026H2.wave]: wave2026H2 as unknown as WaveDefinition,
};

/** True from `opens` (inclusive) until `closes` (exclusive). */
export function isOpen(def: Pick<WaveDefinition, "opens" | "closes">, now: Date): boolean {
  const t = now.getTime();
  return t >= Date.parse(def.opens) && t < Date.parse(def.closes);
}

function walk(elements: SurveyElementJson[] | undefined, out: SurveyElementJson[]): void {
  for (const el of elements ?? []) {
    out.push(el);
    walk(el.elements, out);
  }
}

/** Every answer key a response may contain: question names, plus `<name>-Comment` for Other or comment fields. */
export function allowedAnswerKeys(def: WaveDefinition): Set<string> {
  const all: SurveyElementJson[] = [];
  for (const page of def.survey.pages) walk(page.elements, all);
  const keys = new Set<string>();
  for (const el of all) {
    if (el.type === "panel") continue;
    keys.add(el.name);
    if (el.showOtherItem || el.showCommentArea) keys.add(`${el.name}-Comment`);
  }
  keys.delete(HONEYPOT);
  return keys;
}

/** The provisional values still to be confirmed before launch. */
export function placeholders(def: WaveDefinition): { name: string; value: string }[] {
  return def.placeholders.map((name) => ({ name, value: def[name] }));
}
