import { describe, expect, it } from "vitest";
import { waves } from "../../src/lib/survey/wave";
import { outline } from "../../src/lib/survey/outline";
import { createSurvey } from "../../src/lib/survey/model";

const def = waves["2026-h2"];

describe("outline", () => {
  it("nests the shuffled sections and Your top 3 under Part 3", () => {
    const model = createSurvey(def, {
      storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      random: () => 0.3,
      now: () => new Date(),
    });
    const titles = model.visiblePages.map((p) => p.title);
    const parts = outline(def, titles);

    expect(parts.map((p) => [p.n, p.title, p.pages.length])).toEqual([
      ["1", "About you", 1],
      ["2", "How you use PyPSA", 1],
      ["3", "Rate the roadmap", 7],
      ["4", "Gaps and your work", 1],
    ]);
    expect(parts[2].pages.map((p) => p.title)).toEqual(titles.slice(2, 9));
    expect(parts[2].pages.at(-1)?.title).toBe("Your top 3");
    expect(parts.flatMap((p) => p.pages.map((q) => q.index))).toEqual(titles.map((_, i) => i));
  });
});
