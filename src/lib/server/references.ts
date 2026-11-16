import { sortReferences } from "$lib/references";
import { dataTimestamp, referencesData } from "$lib/data/references";

export type Reference = {
  title: string;
  authors: string;
  year: number;
  citations: number;
  link: string;
};

/** Every reference, without the fields the page never shows. */
export function allReferences(): Reference[] {
  return referencesData.map(({ title, authors, year, citations, link }) => ({
    title,
    authors,
    year,
    citations,
    link,
  }));
}

/** The `n` most-cited references plus the full count and data timestamp. */
export function referencesPage(n: number): {
  initial: Reference[];
  total: number;
  dataTimestamp: string;
} {
  const all = allReferences();
  const initial = sortReferences(all, "citations").slice(0, n);
  return { initial, total: all.length, dataTimestamp };
}
