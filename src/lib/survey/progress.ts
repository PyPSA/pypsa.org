// Saved-progress storage access, free of survey-core so the page can check without loading SurveyJS.
import type { WaveDefinition } from "./wave";

export interface SurveyStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SavedProgress {
  data: Record<string, unknown>;
  currentPageNo: number;
  order: string[];
  startedAt: number;
}

export const storageKey = (def: Pick<WaveDefinition, "wave">) => `pypsa-survey:${def.wave}`;

/** Thrown when the saved entry exists but cannot be used. The page offers a restart via `resetProgress`. */
export class SavedProgressError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SavedProgressError";
  }
}

export function load(def: WaveDefinition, storage: SurveyStorage): SavedProgress | null {
  const raw = storage.getItem(storageKey(def));
  if (!raw) return null;
  let saved: SavedProgress | null;
  try {
    saved = JSON.parse(raw) as SavedProgress | null;
  } catch (cause) {
    throw new SavedProgressError("Saved survey progress is not valid JSON.", { cause });
  }
  const ids = def.sections.map((s) => s.id);
  const validOrder =
    !!saved &&
    Array.isArray(saved.order) &&
    saved.order.length === ids.length &&
    ids.every((id) => saved!.order.includes(id));
  if (!saved || typeof saved.data !== "object" || saved.data === null || !validOrder)
    throw new SavedProgressError("Saved survey progress has an unexpected shape.");
  return saved;
}

/** True when saved progress exists, throws `SavedProgressError` when it is corrupt. */
export function hasSavedProgress(def: WaveDefinition, storage: SurveyStorage): boolean {
  return load(def, storage) !== null;
}

/** Deletes the saved entry of a wave after a `SavedProgressError`. */
export function resetProgress(def: Pick<WaveDefinition, "wave">, storage: SurveyStorage): void {
  storage.removeItem(storageKey(def));
}
