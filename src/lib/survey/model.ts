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
import { HONEYPOT, allowedAnswerKeys, type WaveDefinition } from "./wave";

export { SavedProgressError, hasSavedProgress, resetProgress, storageKey };
export type { SurveyStorage };

export interface SurveyOptions {
  storage: SurveyStorage;
  /** Returns a number in [0, 1), like Math.random. */
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
  website: string;
}

interface State {
  def: WaveDefinition;
  opts: SurveyOptions;
  order: string[];
  startedAt: number;
  cleared: boolean;
}

const states = new WeakMap<Model, State>();

function shuffled<T>(items: T[], random: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function countTop3(value: unknown): number {
  if (!value || typeof value !== "object") return 0;
  return Object.values(value as Record<string, { top3?: unknown[] }>).filter(
    (row) => Array.isArray(row?.top3) && row.top3.length > 0
  ).length;
}

/** Builds the SurveyJS model for a wave with all behaviour attached. */
export function createSurvey(def: WaveDefinition, opts: SurveyOptions): Model {
  const saved = load(def, opts.storage);
  const order =
    saved?.order ??
    shuffled(
      def.sections.map((s) => s.id),
      opts.random
    );

  // The six section pages take the section slots in the respondent's order.
  const json = structuredClone(def.survey) as WaveDefinition["survey"];
  const sectionPages = new Set(def.sections.map((s) => s.page));
  const byId = new Map(def.sections.map((s) => [s.id, s.page]));
  const queue = order.map((id) => json.pages.find((p) => p.name === byId.get(id))!);
  json.pages = json.pages.map((p) => (sectionPages.has(p.name) ? queue.shift()! : p));
  json.pages[0].elements.push({
    type: "text",
    name: HONEYPOT,
    title: "Website",
    titleLocation: "hidden",
    autocomplete: "off",
  });

  const model = new Model(json);
  const state: State = {
    def,
    opts,
    order,
    startedAt: saved?.startedAt ?? opts.now().getTime(),
    cleared: false,
  };
  states.set(model, state);

  // The questionnaire has no hint for the pick limit, so it is added here and kept out of the definition text.
  const q37 = model.getQuestionByName("q3_7");
  if (q37 && !q37.description) q37.description = "Pick up to three.";

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
  });

  model.onValidateQuestion.add((_, o) => {
    if (o.name === "q2_9") {
      const n = countTop3(o.value);
      if (n > 3) o.error = `Mark at most three features as Top 3 (you marked ${n}).`;
    } else if (o.name === "q3_7") {
      const n = Array.isArray(o.value) ? o.value.length : 0;
      if (n > 3) o.error = `Pick at most three features (you picked ${n}).`;
    }
  });

  // Hide the honeypot from people and assistive technology.
  model.onAfterRenderQuestion.add((_, o) => {
    if (o.question.name !== HONEYPOT) return;
    const el = o.htmlElement as HTMLElement;
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = "position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;";
    el.querySelectorAll("input").forEach((i) => i.setAttribute("tabindex", "-1"));
  });

  const save = () => {
    if (state.cleared) return;
    const entry: SavedProgress = {
      data: model.data,
      currentPageNo: model.currentPageNo,
      order: state.order,
      startedAt: state.startedAt,
    };
    try {
      opts.storage.setItem(storageKey(def), JSON.stringify(entry));
    } catch (error) {
      // The survey keeps working without a saved copy, the page tells the respondent.
      opts.onSaveError?.(error);
    }
  };
  if (saved) {
    model.data = saved.data;
    model.currentPageNo = Math.min(saved.currentPageNo, model.visiblePages.length - 1);
  }
  syncTitle();
  model.onValueChanged.add(() => {
    syncTitle();
    save();
  });
  model.onCurrentPageChanged.add(save);

  return model;
}

function stateOf(model: Model): State {
  const state = states.get(model);
  if (!state) throw new Error("Model was not created by createSurvey.");
  return state;
}

/** Resets the timer to now. Call when the respondent presses Start. */
export function startSurvey(model: Model): void {
  const state = stateOf(model);
  state.startedAt = state.opts.now().getTime();
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
    seconds: Math.max(0, Math.round((state.opts.now().getTime() - state.startedAt) / 1000)),
    section_order: state.order,
    answers,
    website: typeof honey === "string" ? honey : "",
  };
}
