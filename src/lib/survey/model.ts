// Headless SurveyJS model, DOM-free apart from the honeypot hiding hook.
import { ItemValue, Model } from "survey-core";
import {
  SavedProgressError,
  hasSavedProgress,
  load,
  resetProgress,
  storageKey,
  type SavedProgress,
  type SurveyStorage,
} from "./progress";
import { mulberry32 } from "./random";
import {
  HONEYPOT,
  MAX_SECONDS,
  MAX_TEXT_LENGTH,
  isRecord,
  flattenElements,
  allowedAnswerKeys,
  type SurveyElementJson,
  type WaveDefinition,
} from "./wave";

export { SavedProgressError, hasSavedProgress, resetProgress, storageKey };
export type { SurveyStorage };

export interface SurveyOptions {
  storage: SurveyStorage;
  /** Returns a number in [0, 1), like Math.random. Only draws the seed of a fresh respondent. */
  random: () => number;
  now: () => Date;
  /** Called when writing progress to storage fails, so the page can warn that answers are not kept. */
  onSaveError?: (error: unknown) => void;
}

export interface SurveyPayload {
  wave: string;
  version: number;
  seconds: number;
  section_order: string[];
  answers: Record<string, unknown>;
  [HONEYPOT]: string;
}

interface State {
  def: WaveDefinition;
  opts: SurveyOptions;
  order: string[];
  seed: number;
  /** Visible time before the current span, in ms. */
  activeMs: number;
  /** When the current visible span began, null while hidden. */
  visibleSince: number | null;
  held: boolean;
  dirty: boolean;
  cleared: boolean;
}

const states = new WeakMap<Model, State>();
const saves = new WeakMap<Model, () => void>();

function shuffled<T>(items: T[], random: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Choices that must stay at the end of the list. */
const pinned = (c: unknown) =>
  typeof c === "object" && c !== null && ("other" in c || "isExclusive" in c);

function shuffleChoices<T>(choices: T[], random: () => number): T[] {
  return [
    ...shuffled(
      choices.filter((c) => !pinned(c)),
      random
    ),
    ...choices.filter(pinned),
  ];
}

function findElement(json: WaveDefinition["survey"], name: string): SurveyElementJson | undefined {
  return flattenElements(json.pages.flatMap((p) => p.elements)).find((el) => el.name === name);
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Rows of a matrix value that carry a Top 3 tick. */
function countTop3(value: unknown): number {
  if (!value || typeof value !== "object") return 0;
  return Object.values(value as Record<string, { top3?: unknown[] }>).filter(
    (row) => Array.isArray(row?.top3) && row.top3.length > 0
  ).length;
}

interface MatrixLike {
  visibleRows?: {
    cells: {
      column: { name: string };
      question: {
        value: unknown;
        readOnly: boolean;
        choices?: { setIsEnabled(enabled: boolean): void }[];
      };
    }[];
  }[];
}

/** How many Top 3 picks a question holds, and whether the limit of three is reached. */
export function top3State(model: Model, name: "q2_9" | "q3_7"): { picked: number; full: boolean } {
  const value = model.getValue(name);
  const picked = name === "q2_9" ? countTop3(value) : Array.isArray(value) ? value.length : 0;
  return { picked, full: picked >= 3 };
}

/** Index of the first visible page that fails validation, or -1. */
export function firstInvalidPage(model: Model): number {
  return model.visiblePages.findIndex((p) => p.hasErrors(false));
}

/** Validates one visible page and shows its errors. True when it is valid. */
export function validatePage(model: Model, index: number): boolean {
  return !model.visiblePages[index].hasErrors(true);
}

/**
 * Moves to a visible page no further than `reached`, staying put when a forward jump fails validation.
 */
export function jumpToPage(model: Model, index: number, reached: number): boolean {
  if (index < 0 || index > reached || index >= model.visiblePages.length) return false;
  if (index === model.currentPageNo) return true;
  if (index > model.currentPageNo && !validatePage(model, model.currentPageNo)) return false;
  model.currentPageNo = index;
  return true;
}

/** Free text a question holds: its own string value, its Other comment and per-choice comments. */
function freeTexts(model: Model, name: string, value: unknown): string[] {
  const other = model.getValue(`${name}-Comment`);
  const picks = Array.isArray(value) ? value : [value];
  return [
    ...picks.map((p) => (typeof p === "string" ? p : isRecord(p) ? p.comment : undefined)),
    other,
  ].filter((t): t is string => typeof t === "string");
}

/** Builds the SurveyJS model for a wave with all behaviour attached. */
export function createSurvey(def: WaveDefinition, opts: SurveyOptions): Model {
  const saved = load(def, opts.storage);
  const seed = saved?.seed ?? Math.floor(opts.random() * 2 ** 32);
  // One PRNG drives every random order, in a fixed sequence.
  const rng = mulberry32(seed);
  const order = shuffled(
    def.sections.map((s) => s.id),
    rng
  );

  // The six section pages take the section slots in the respondent's order.
  const json = structuredClone(def.survey) as WaveDefinition["survey"];
  const sectionPages = new Set(def.sections.map((s) => s.page));
  const byId = new Map(def.sections.map((s) => [s.id, s.page]));
  const queue = order.map((id) => json.pages.find((p) => p.name === byId.get(id))!);
  json.pages = json.pages.map((p) => (sectionPages.has(p.name) ? queue.shift()! : p));
  const shuffleOf = (name: string, key: "choices" | "rows") => {
    const el = findElement(json, name);
    if (!el || !Array.isArray(el[key])) return;
    if (key === "choices") el.choices = shuffleChoices(el.choices ?? [], rng);
    else el.rows = shuffled(el.rows ?? [], rng);
  };
  // The slider range doubles as the number limit, so the form fails before the Worker does.
  for (const [name, { max, orMore }] of Object.entries(def.sliders)) {
    const el = findElement(json, name);
    const shown = max.toLocaleString("en-US");
    const maxErrorText = orMore
      ? `Enter ${shown} for ${shown} or more.`
      : `Enter a number up to ${shown}.`;
    if (el) Object.assign(el, { min: 0, max, maxErrorText });
  }
  // The same cap as the Worker's, for text, comment and Other fields alike.
  Object.assign(json, { maxTextLength: MAX_TEXT_LENGTH, maxCommentLength: MAX_TEXT_LENGTH });
  shuffleOf("q2_1", "choices");
  shuffleOf("q2_9", "rows");
  for (let i = 1; i <= 6; i++) shuffleOf(`q3_${i}`, "rows");
  shuffleOf("q3_7", "choices");
  json.pages[0].elements.push({
    type: "text",
    name: HONEYPOT,
    title: "Leave this field empty",
    titleLocation: "hidden",
  });

  const model = new Model(json);
  const state: State = {
    def,
    opts,
    order,
    seed,
    activeMs: saved?.activeMs ?? 0,
    visibleSince: opts.now().getTime(),
    held: false,
    dirty: false,
    cleared: false,
  };
  states.set(model, state);

  const q21 = model.getQuestionByName("q2_1");
  const q21Title = q21?.title;
  const syncTitle = () => {
    if (!q21) return;
    q21.title = model.getValue("q1_3") === "not_used" ? def.nonUser.q2_1Title : q21Title;
  };

  // The text event passes the matrix question, so match on question and row text.
  const descriptions = new Map<string, string>();
  for (const page of def.survey.pages)
    for (const el of page.elements)
      for (const row of el.rows ?? [])
        if (row.description) descriptions.set(`${el.name}\u0000${row.text}`, row.description);
  const columnNumbers = new Map<string, string>();
  for (const page of def.survey.pages)
    for (const el of page.elements)
      for (const col of el.columns ?? [])
        if (/^[1-5]$/.test(String(col.value)))
          columnNumbers.set(`${el.name}\u0000${col.text}`, String(col.value));
  model.onTextMarkdown.add((_, o) => {
    const desc = descriptions.get(`${o.element?.name}\u0000${o.text}`);
    if (o.name === "text" && desc && !(o.element instanceof ItemValue))
      o.html = `<span>${escapeHtml(o.text)}<span class="rowdesc">${escapeHtml(desc)}</span></span>`;
    // Scale columns read "1 Not relevant" to "5 Critical", the definition keeps the questionnaire's bare labels.
    const scale = columnNumbers.get(`${o.element?.name}\u0000${o.text}`);
    if (o.name === "text" && scale) o.html = `${scale} ${escapeHtml(o.text)}`;
    // Plain text, since SurveyJS also puts this html into aria labels.
    if (!o.html && o.text.includes("`")) o.html = escapeHtml(o.text.replaceAll("`", ""));
  });

  // 3.7 offers only the features rated High or Critical, or all of them when none are.
  const q37 = model.getQuestionByName("q3_7");
  const highRated = () => {
    const high = new Set<unknown>();
    for (let i = 1; i <= 6; i++) {
      const ratings = model.getValue(`q3_${i}`);
      if (isRecord(ratings))
        for (const [feature, r] of Object.entries(ratings))
          if (r === "4" || r === "5") high.add(feature);
    }
    return high;
  };
  model.onShowingChoiceItem.add((_, o) => {
    if (o.question.name !== "q3_7") return;
    const high = highRated();
    if (high.size) o.visible = high.has(o.item.value);
  });
  const syncQ37 = () => {
    if (!q37 || model.currentPage?.name !== "p3_7") return;
    const high = highRated();
    q37.description = high.size
      ? "From the features you rated High or Critical."
      : "You rated no feature High or Critical, so all of them are listed.";
    // Picks whose rating was lowered since are dropped.
    if (high.size && Array.isArray(q37.value)) {
      const kept = q37.value.filter((v: unknown) => high.has(v));
      if (kept.length !== q37.value.length) q37.value = kept;
    }
  };
  model.onCurrentPageChanged.add(syncQ37);

  // Once three rows are Top 3, the other rows' cells lock until one is unticked.
  const syncTop3 = () => {
    const matrix = model.getQuestionByName("q2_9") as unknown as MatrixLike | null;
    if (!matrix) return;
    const full = top3State(model, "q2_9").full;
    for (const row of matrix.visibleRows ?? []) {
      const cell = row.cells.find((c) => c.column.name === "top3")?.question;
      if (!cell) continue;
      const ticked = Array.isArray(cell.value) && cell.value.length > 0;
      cell.readOnly = full && !ticked;
      // A native checkbox ignores readonly, so the choice is disabled too.
      for (const choice of cell.choices ?? []) choice.setIsEnabled(!(full && !ticked));
    }
  };
  model.onMatrixCellCreated.add(syncTop3);
  model.onValueChanged.add((_, o) => {
    if (o.name === "q2_9") syncTop3();
  });
  model.onCurrentPageChanged.add(syncTop3);

  model.onValidateQuestion.add((_, o) => {
    if (o.name === "q2_9") {
      const n = countTop3(o.value);
      if (n > 3) o.error = `Mark at most three features as Top 3 (you marked ${n}).`;
    } else if (o.name === "q3_7") {
      const n = Array.isArray(o.value) ? o.value.length : 0;
      if (n > 3) o.error = `Pick at most three features (you picked ${n}).`;
    }
    if (!o.error && freeTexts(model, o.name, o.value).some((t) => t.length > MAX_TEXT_LENGTH))
      o.error = `Keep this under ${MAX_TEXT_LENGTH.toLocaleString("en-US")} characters.`;
  });

  // Hide the honeypot from people and assistive technology.
  model.onAfterRenderQuestion.add((_, o) => {
    if (o.question.name !== HONEYPOT) return;
    const el = o.htmlElement as HTMLElement;
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = "position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;";
    el.querySelectorAll("input").forEach((i) => {
      i.setAttribute("tabindex", "-1");
      i.setAttribute("autocomplete", "off");
    });
  });

  const save = () => {
    if (state.cleared) return;
    if (state.held) {
      state.dirty = true;
      return;
    }
    state.dirty = false;
    // A filled honeypot is never written down.
    const data = { ...(model.data as Record<string, unknown>) };
    delete data[HONEYPOT];
    const entry: SavedProgress = {
      data,
      currentPageNo: model.currentPageNo,
      seed: state.seed,
      activeMs: activeMs(state),
    };
    try {
      opts.storage.setItem(storageKey(def), JSON.stringify(entry));
    } catch (error) {
      // The survey keeps working without a saved copy, the page tells the respondent.
      opts.onSaveError?.(error);
    }
  };
  saves.set(model, save);
  if (saved) {
    model.data = saved.data;
    model.currentPageNo = Math.min(saved.currentPageNo, model.visiblePages.length - 1);
  }
  syncTitle();
  syncTop3();
  model.onValueChanged.add(() => {
    syncTitle();
    save();
  });
  model.onCurrentPageChanged.add(save);
  syncQ37();

  return model;
}

function stateOf(model: Model): State {
  const state = states.get(model);
  if (!state) throw new Error("Model was not created by createSurvey.");
  return state;
}

/** Active time so far: the closed spans plus the open one. */
function activeMs(state: State): number {
  const open = state.visibleSince === null ? 0 : state.opts.now().getTime() - state.visibleSince;
  return state.activeMs + Math.max(0, open);
}

/** Resets the active time to 0 and starts counting. Call when the respondent presses Start. */
export function startSurvey(model: Model): void {
  const state = stateOf(model);
  state.activeMs = 0;
  state.visibleSince = state.opts.now().getTime();
}

/** Pauses or resumes the active time when the tab hides or shows, and saves. */
export function setVisible(model: Model, visible: boolean): void {
  const state = stateOf(model);
  if (visible && state.visibleSince === null) {
    state.visibleSince = state.opts.now().getTime();
  } else if (!visible && state.visibleSince !== null) {
    state.activeMs = activeMs(state);
    state.visibleSince = null;
  }
  saves.get(model)?.();
}

/** Defers saves while `on` and writes once when released, so a burst of changes costs one write. */
export function holdSaves(model: Model, on: boolean): void {
  const state = stateOf(model);
  state.held = on;
  if (!on && state.dirty) saves.get(model)?.();
}

/** Removes the saved progress and stops further saving. Call after the Worker returned success. */
export function clearProgress(model: Model): void {
  const state = stateOf(model);
  state.cleared = true;
  state.opts.storage.removeItem(storageKey(state.def));
}

/** The response body for `POST /api/survey`. Unknown and hidden questions are left out. */
export function buildPayload(model: Model): SurveyPayload {
  const state = stateOf(model);
  const allowed = allowedAnswerKeys(state.def);
  const answers: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(model.data as Record<string, unknown>)) {
    if (!allowed.has(key)) continue;
    const question = model.getQuestionByName(key.replace(/-Comment$/, ""));
    if (!question || !question.isVisible || !question.isParentVisible) continue;
    answers[key] = value;
  }
  const honey = model.getValue(HONEYPOT);
  return {
    wave: state.def.wave,
    version: state.def.version,
    seconds: Math.min(MAX_SECONDS, Math.max(0, Math.round(activeMs(state) / 1000))),
    section_order: state.order,
    answers,
    [HONEYPOT]: typeof honey === "string" ? honey : "",
  };
}
