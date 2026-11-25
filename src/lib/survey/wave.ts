// Pure wave helpers shared by the browser and the Worker, so never import survey-core.
import wave2026H2 from "./waves/2026-h2.json";
import { fillCloses } from "./format";
import { isOpen, type WaveMeta } from "./meta";
import { meta2026H2 } from "./waves/2026-h2.meta";

export { isOpen };

/** Name of the hidden honeypot field. Added to the model at runtime, not in the definition. */
export const HONEYPOT = "hp_field";

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
  isRequired?: boolean;
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

export interface WaveQuestionnaire {
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

export type WaveDefinition = WaveMeta & WaveQuestionnaire;

/** Joins the metadata to the questionnaire: the title and the `{closes}` bullet dates come from the metadata. */
function build(meta: WaveMeta, q: WaveQuestionnaire): WaveDefinition {
  const bullets = q.welcome.bullets.map((b) =>
    b.map((seg) => ({ ...seg, text: fillCloses(seg.text, meta.closes) }))
  );
  return {
    ...meta,
    ...q,
    welcome: { ...q.welcome, bullets },
    survey: { ...q.survey, title: meta.title },
  };
}

export const waves: Record<string, WaveDefinition> = {
  [meta2026H2.wave]: build(meta2026H2, wave2026H2 as unknown as WaveQuestionnaire),
};

/** Every element of a tree, nested ones included, in document order. */
export function flattenElements(elements: SurveyElementJson[] | undefined): SurveyElementJson[] {
  return (elements ?? []).flatMap((el) => [el, ...flattenElements(el.elements)]);
}

/** Every answer key a response may contain: question names, plus `<name>-Comment` for Other or comment fields. */
export function allowedAnswerKeys(def: WaveDefinition): Set<string> {
  const all = def.survey.pages.flatMap((p) => flattenElements(p.elements));
  const keys = new Set<string>();
  for (const el of all) {
    if (el.type === "panel") continue;
    keys.add(el.name);
    if (el.showOtherItem || el.showCommentArea) keys.add(`${el.name}-Comment`);
  }
  keys.delete(HONEYPOT);
  return keys;
}

export type ErrorCode =
  | "unsupported_media_type"
  | "method_not_allowed"
  | "rate_limited"
  | "payload_too_large"
  | "malformed_json"
  | "not_object"
  | "unknown_wave"
  | "wave_closed"
  | "wrong_version"
  | "invalid_seconds"
  | "invalid_section_order"
  | "invalid_answers"
  | "unknown_answer_key"
  | "invalid_choice"
  | "invalid_matrix_cell"
  | "invalid_number"
  | "text_too_long"
  | "missing_required"
  | "too_many_top3"
  | "too_many_picks"
  | "storage_failed";

export type ValidationResult = { ok: true } | { ok: false; code: ErrorCode };

/** Longest accepted free text or comment, in characters. */
export const MAX_TEXT_LENGTH = 5000;
/** Seven days of active time, in seconds. */
export const MAX_SECONDS = 604800;
const MAX_TOP3 = 3;

export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const fail = (code: ErrorCode): ValidationResult => ({ ok: false, code });
const OK: ValidationResult = { ok: true };

/** A comment or the text of a text field: a string within the length cap. */
function checkText(value: unknown, code: ErrorCode): ValidationResult {
  if (typeof value !== "string") return fail(code);
  return value.length > MAX_TEXT_LENGTH ? fail("text_too_long") : OK;
}

function checkChoices(
  el: SurveyElementJson,
  value: unknown,
  answers: Record<string, unknown>
): ValidationResult {
  const known = new Map((el.choices ?? []).map((c) => [c.value, c]));
  const multiple = el.type === "checkbox";
  const picks = multiple ? value : [value];
  if (!Array.isArray(picks)) return fail("invalid_choice");
  if (
    multiple &&
    el.maxSelectedChoices !== undefined &&
    picks.length > Number(el.maxSelectedChoices)
  )
    return fail("too_many_picks");
  if (new Set(picks.map((p) => (isRecord(p) ? p.value : p))).size !== picks.length)
    return fail("invalid_choice");
  for (const pick of picks) {
    if (typeof pick === "string") {
      if (known.has(pick)) continue;
      if (pick === "other" && el.showOtherItem && typeof answers[`${el.name}-Comment`] === "string")
        continue;
      return fail("invalid_choice");
    }
    // A showCommentArea choice of a checkbox is stored as { value, comment }.
    if (multiple && isRecord(pick) && typeof pick.value === "string") {
      const choice = known.get(pick.value);
      if (!choice) return fail("invalid_choice");
      if (pick.comment !== undefined) {
        if (!choice.showCommentArea) return fail("invalid_choice");
        const bad = checkText(pick.comment, "invalid_choice");
        if (!bad.ok) return bad;
      }
      continue;
    }
    return fail("invalid_choice");
  }
  return OK;
}

function checkMatrix(el: SurveyElementJson, value: unknown): ValidationResult {
  if (!isRecord(value)) return fail("invalid_matrix_cell");
  const rows = new Set((el.rows ?? []).map((r) => r.value));
  const cols = new Set((el.columns ?? []).map((c) => c.value));
  for (const [row, cell] of Object.entries(value))
    if (!rows.has(row) || typeof cell !== "string" || !cols.has(cell))
      return fail("invalid_matrix_cell");
  return OK;
}

/** A matrix of checkbox columns: row to { column: [slugs] }, counting the `top3` column. */
function checkMatrixDropdown(el: SurveyElementJson, value: unknown): ValidationResult {
  if (!isRecord(value)) return fail("invalid_matrix_cell");
  const rows = new Set((el.rows ?? []).map((r) => r.value));
  const columns = new Map(
    ((el.columns ?? []) as unknown as { name: string; choices?: { value: string }[] }[]).map(
      (c) => [c.name, new Set((c.choices ?? []).map((o) => o.value))]
    )
  );
  let top3 = 0;
  for (const [row, cells] of Object.entries(value)) {
    if (!rows.has(row) || !isRecord(cells)) return fail("invalid_matrix_cell");
    for (const [column, picks] of Object.entries(cells)) {
      const allowed = columns.get(column);
      if (!allowed || !Array.isArray(picks) || picks.length === 0)
        return fail("invalid_matrix_cell");
      if (!picks.every((p) => typeof p === "string" && allowed.has(p)))
        return fail("invalid_matrix_cell");
      if (column === "top3") top3++;
    }
  }
  return top3 > MAX_TOP3 ? fail("too_many_top3") : OK;
}

function checkAnswer(
  def: WaveDefinition,
  el: SurveyElementJson,
  value: unknown,
  answers: Record<string, unknown>
): ValidationResult {
  switch (el.type) {
    case "radiogroup":
    case "dropdown":
    case "checkbox":
      return checkChoices(el, value, answers);
    case "matrix":
      return checkMatrix(el, value);
    case "matrixdropdown":
      return checkMatrixDropdown(el, value);
    case "text":
      if (el.inputType === "number") {
        const max = def.sliders[el.name]?.max ?? Infinity;
        return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= max
          ? OK
          : fail("invalid_number");
      }
      return checkText(value, "invalid_answers");
    case "comment":
      return checkText(value, "invalid_answers");
    default:
      return fail("invalid_answers");
  }
}

/** Structural check of a parsed response body against the wave definition. Does not check the wave itself. */
export function validateResponse(
  def: WaveDefinition,
  body: Record<string, unknown>
): ValidationResult {
  if (body.version !== def.version) return fail("wrong_version");

  const { seconds, section_order: order, answers } = body;
  if (!Number.isInteger(seconds) || (seconds as number) < 0 || (seconds as number) > MAX_SECONDS)
    return fail("invalid_seconds");
  const ids = def.sections.map((s) => s.id);
  if (
    !Array.isArray(order) ||
    order.length !== ids.length ||
    new Set(order).size !== ids.length ||
    !order.every((id) => ids.includes(id))
  )
    return fail("invalid_section_order");

  if (!isRecord(answers)) return fail("invalid_answers");
  const allowed = allowedAnswerKeys(def);
  if (Object.keys(answers).some((k) => !allowed.has(k))) return fail("unknown_answer_key");
  const all = def.survey.pages.flatMap((p) => flattenElements(p.elements));
  const byName = new Map(all.map((el) => [el.name, el]));
  for (const el of all)
    if (el.isRequired && answers[el.name] === undefined) return fail("missing_required");
  for (const [key, value] of Object.entries(answers)) {
    if (key.endsWith("-Comment") && !byName.has(key)) {
      const bad = checkText(value, "invalid_answers");
      if (!bad.ok) return bad;
      continue;
    }
    const result = checkAnswer(def, byName.get(key)!, value, answers);
    if (!result.ok) return result;
  }
  return OK;
}
