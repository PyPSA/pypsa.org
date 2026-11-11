import { base } from "$app/paths";
import type { Reference } from "$lib/server/references";

export type { Reference };
export type SortMode = "citations" | "latest";

/** Returns a sorted copy: most cited first, or newest year first. */
export function sortReferences(list: Reference[], mode: SortMode): Reference[] {
  return [...list].sort((a, b) =>
    mode === "citations" ? b.citations - a.citations : b.year - a.year
  );
}

let cached: Promise<Reference[]> | undefined;

/** Fetches the full reference list once; later calls reuse the result. */
export function loadAllReferences(): Promise<Reference[]> {
  cached ??= fetch(`${base}/data/references.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`references.json: HTTP ${res.status}`);
      return res.json() as Promise<Reference[]>;
    })
    .catch((err) => {
      cached = undefined;
      throw err;
    });
  return cached;
}
