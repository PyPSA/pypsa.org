import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildPath, builtHtmlFiles, parse, readBuilt } from "./helpers";

const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

describe("landmarks", () => {
  it.each(["index.html", "roadmap.html", "events.html", "embed/contributors.html"])(
    "%s has exactly one main",
    (file) => {
      expect(readBuilt(file).match(/<main[\s>]/g) ?? []).toHaveLength(1);
    },
  );
});

describe("accessible names", () => {
  const files = builtHtmlFiles();

  it("every button has text content or an aria-label", () => {
    const bad: string[] = [];
    for (const f of files) {
      for (const b of parse(readBuilt(f)).querySelectorAll("button")) {
        if (!b.getAttribute("aria-label")?.trim() && !b.textContent.trim()) {
          bad.push(`${f}: ${b.outerHTML.slice(0, 120)}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("no aria-label leaves out the element's visible text", () => {
    const bad: string[] = [];
    for (const f of files) {
      const root = parse(readBuilt(f));
      root.querySelectorAll("script, style, template, noscript").forEach((n) => n.remove());
      for (const el of root.querySelectorAll("a[aria-label], button[aria-label], [role=button][aria-label]")) {
        const label = norm(el.getAttribute("aria-label")!);
        const text = norm(el.textContent);
        if (text && !label.includes(text)) bad.push(`${f}: "${label}" vs "${text}"`);
      }
    }
    expect(bad).toEqual([]);
  });
});

const channel = (hex: string) => {
  const c = parseInt(hex, 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) =>
  0.2126 * channel(hex.slice(1, 3)) + 0.7152 * channel(hex.slice(3, 5)) + 0.0722 * channel(hex.slice(5, 7));
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("brand text tokens", () => {
  const dir = buildPath("_app/immutable/assets");
  const css = readdirSync(dir)
    .filter((f) => f.endsWith(".css"))
    .map((f) => readFileSync(join(dir, f), "utf8"))
    .join("\n");

  const themes = {
    light: { bg: "#ffffff", muted: "#f5f5f5" },
    // Dark muted surfaces are `bg-muted/60` over the page: #262626 at 60% over #0a0a0a.
    dark: { bg: "#0a0a0a", muted: "#1b1b1b" },
  };

  it.each(["--brand-green-text", "--brand-blue-text"])("%s reaches 4.5:1 in both themes", (token) => {
    const values = [...css.matchAll(new RegExp(`${token}:\\s*(#[0-9a-fA-F]{6})`, "g"))].map((m) => m[1]);
    expect(values).toHaveLength(2);
    const [light, dark] = values;
    for (const [value, theme] of [
      [light, themes.light],
      [dark, themes.dark],
    ] as const) {
      expect(ratio(value, theme.bg)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(value, theme.muted)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
