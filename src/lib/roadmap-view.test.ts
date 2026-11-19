import { describe, expect, it } from "vitest";
import type { RoadmapItem } from "$lib/data/roadmap";
import { formatDescription, iconPaths, splitRoadmap } from "./roadmap-view";

const CODE_OPEN = '<code class="rounded bg-muted px-1 py-0.5 text-[0.85em] font-mono">';

describe("formatDescription", () => {
  it("returns plain text unchanged", () => {
    expect(formatDescription("Just text.")).toBe("Just text.");
  });

  it("escapes &, < and > without double escaping", () => {
    expect(formatDescription("a & b < c > d")).toBe("a &amp; b &lt; c &gt; d");
    expect(formatDescription("<b>")).toBe("&lt;b&gt;");
  });

  it("wraps backtick spans in <code>", () => {
    expect(formatDescription("use `foo` here")).toBe(`use ${CODE_OPEN}foo</code> here`);
  });

  it("handles several spans in one string", () => {
    expect(formatDescription("`a` and `b`")).toBe(`${CODE_OPEN}a</code> and ${CODE_OPEN}b</code>`);
  });

  it("escapes content inside code spans", () => {
    expect(formatDescription("`a<b`")).toBe(`${CODE_OPEN}a&lt;b</code>`);
  });

  it("leaves an unmatched backtick literal", () => {
    expect(formatDescription("a ` b")).toBe("a ` b");
  });
});

const item = (id: string, date?: string): RoadmapItem => ({
  id,
  title: id,
  description: "",
  ...(date ? { date } : {}),
});

describe("splitRoadmap", () => {
  it("keeps planned items in input order", () => {
    const { planned, shipped } = splitRoadmap([item("b"), item("a"), item("c")]);
    expect(planned.map((i) => i.id)).toEqual(["b", "a", "c"]);
    expect(shipped).toEqual([]);
  });

  it("sorts shipped items newest first", () => {
    const { planned, shipped } = splitRoadmap([
      item("old", "2020-01-01"),
      item("p"),
      item("new", "2025-06-01"),
      item("mid", "2023-03-03"),
    ]);
    expect(planned.map((i) => i.id)).toEqual(["p"]);
    expect(shipped.map((i) => i.id)).toEqual(["new", "mid", "old"]);
  });

  it("keeps equal dates in input order", () => {
    const { shipped } = splitRoadmap([
      item("x", "2024-01-01"),
      item("y", "2024-01-01"),
      item("z", "2024-01-01"),
    ]);
    expect(shipped.map((i) => i.id)).toEqual(["x", "y", "z"]);
  });

  it("returns two empty lists for no items", () => {
    expect(splitRoadmap([])).toEqual({ planned: [], shipped: [] });
  });
});

describe("iconPaths", () => {
  it("maps names to non-empty SVG path strings", () => {
    for (const [name, path] of Object.entries(iconPaths)) {
      expect(path, name).toMatch(/^[Mm][\d\s.,a-zA-Z-]+$/);
    }
  });
});
