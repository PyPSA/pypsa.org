import { describe, expect, it } from "vitest";
import { roadmapData } from "./roadmap";
import { iconPaths } from "$lib/roadmap-view";

// Dated milestones that are not releases and so carry no version
// (the first commit predates any tagged release).
const VERSIONLESS_MILESTONES = ["pypsa-first-commit"];

describe("roadmapData", () => {
  it("has unique ids", () => {
    const ids = roadmapData.map((i) => i.id);
    expect(ids.filter((id, n) => ids.indexOf(id) !== n)).toEqual([]);
  });

  it("only uses icons present in iconPaths", () => {
    const missing = roadmapData.filter((i) => i.icon && !(i.icon in iconPaths));
    expect(missing.map((i) => `${i.id}: ${i.icon}`)).toEqual([]);
  });

  it("has valid ISO dates", () => {
    for (const { id, date } of roadmapData) {
      if (date === undefined) continue;
      expect(date, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(date + "T00:00:00Z").toISOString().slice(0, 10), id).toBe(date);
    }
  });

  it("gives dated items a version, except allowlisted milestones", () => {
    const bad = roadmapData.filter(
      (i) => i.date && !i.version && !VERSIONLESS_MILESTONES.includes(i.id)
    );
    expect(bad.map((i) => i.id)).toEqual([]);
  });

  it("gives undated items neither date nor version", () => {
    const bad = roadmapData.filter((i) => !i.date && (i.date !== undefined || i.version));
    expect(bad.map((i) => i.id)).toEqual([]);
  });
});
