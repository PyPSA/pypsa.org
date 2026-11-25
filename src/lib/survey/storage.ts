// Wraps every storage access, moving to an in-memory Map on any exception.
import type { SurveyStorage } from "./progress";

export interface OpenedStorage {
  storage: SurveyStorage;
  /** False once the browser storage failed and answers live only in memory. */
  persistent(): boolean;
  /** Runs `cb` once when storage first fails, or at once if it already has. */
  onFallback(cb: () => void): void;
}

export function openStorage(get: () => Storage): OpenedStorage {
  let backing: Storage | null = null;
  let memory: Map<string, string> | null = null;
  // What was read or written so far, to seed the Map on fallback.
  const seen = new Map<string, string>();
  const callbacks: (() => void)[] = [];

  const fallBack = () => {
    if (memory) return;
    memory = new Map(seen);
    for (const cb of callbacks.splice(0)) cb();
  };
  const use = <T>(viaBacking: (s: Storage) => T, viaMemory: (m: Map<string, string>) => T): T => {
    if (!memory) {
      try {
        backing ??= get();
        return viaBacking(backing);
      } catch {
        fallBack();
      }
    }
    return viaMemory(memory!);
  };

  const storage: SurveyStorage = {
    getItem: (key) =>
      use(
        (s) => {
          const value = s.getItem(key);
          if (value === null) seen.delete(key);
          else seen.set(key, value);
          return value;
        },
        (m) => m.get(key) ?? null
      ),
    setItem: (key, value) =>
      use(
        (s) => {
          s.setItem(key, value);
          seen.set(key, value);
        },
        (m) => void m.set(key, value)
      ),
    removeItem: (key) =>
      use(
        (s) => {
          s.removeItem(key);
          seen.delete(key);
        },
        (m) => void m.delete(key)
      ),
  };

  return {
    storage,
    persistent: () => memory === null,
    onFallback(cb) {
      if (memory) cb();
      else callbacks.push(cb);
    },
  };
}
