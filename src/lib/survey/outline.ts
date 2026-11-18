// Groups the survey's visible pages by Part for the section list and the progress strip.
import type { WaveDefinition } from "./wave";

export interface OutlinePage {
  index: number;
  title: string;
}

export interface OutlinePart {
  n: string;
  title: string;
  pages: OutlinePage[];
}

const PART = /^Part (\d+): (.+)$/;

/** A page titled "Part N: X" is a Part of its own. The pages without a Part title fall under Part 3. */
export function outline(def: WaveDefinition, titles: string[]): OutlinePart[] {
  // ponytail: only Part 3 has sub-pages, a wave with more needs a page-to-Part map in the definition.
  const [, n3, title3] = def.part3.title.match(PART)!;
  const parts: OutlinePart[] = [];
  titles.forEach((title, index) => {
    const m = title.match(PART);
    const last = parts.at(-1);
    if (m) parts.push({ n: m[1], title: m[2], pages: [{ index, title: m[2] }] });
    else if (last?.n === n3) last.pages.push({ index, title });
    else parts.push({ n: n3, title: title3, pages: [{ index, title }] });
  });
  return parts;
}
