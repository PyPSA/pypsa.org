import { describe, expect, it } from "vitest";
import { HONEYPOT, allowedAnswerKeys, isOpen, waves } from "../../src/lib/survey/wave";

import { surveyMeta } from "../../src/lib/survey/current";

const def = waves["2026-h2"];

describe("single source of truth", () => {
  it("states the last open day in the closing welcome bullet", () => {
    const last = def.welcome.bullets
      .at(-1)!
      .map((s) => s.text)
      .join("");
    expect(last).toBe("The survey closes on 20 December 2026.");
    expect(JSON.stringify(def.welcome)).not.toContain("{closes}");
  });
  it("takes the survey title from the metadata", () => {
    expect(def.survey.title).toBe(surveyMeta.title);
    expect(def.title).toBe(surveyMeta.title);
  });
});

describe("isOpen", () => {
  it("is closed before the window opens", () => {
    expect(isOpen(def, new Date("2026-11-24T22:59:59Z"))).toBe(false);
  });
  it("is open from the opening instant", () => {
    expect(isOpen(def, new Date("2026-11-24T23:00:00Z"))).toBe(true);
  });
  it("is open inside the window, including the last day", () => {
    expect(isOpen(def, new Date("2026-12-01T12:00:00Z"))).toBe(true);
    expect(isOpen(def, new Date("2026-12-20T22:59:59Z"))).toBe(true);
  });
  it("is closed from the closing instant (end of 20 December, CET)", () => {
    expect(isOpen(def, new Date("2026-12-20T23:00:00Z"))).toBe(false);
    expect(isOpen(def, new Date("2027-01-01T00:00:00Z"))).toBe(false);
  });
});

describe("allowedAnswerKeys", () => {
  const keys = allowedAnswerKeys(def);
  it("contains question names, including those nested in panels", () => {
    for (const k of [
      "q1_1",
      "q1_4",
      "q2_9",
      "q2_6_snapshots",
      "q2_6_scope",
      "q3_1",
      "q3_6_3",
      "q4_4",
    ]) {
      expect(keys.has(k)).toBe(true);
    }
  });
  it("adds -Comment keys for Other choices but not for plain questions", () => {
    expect(keys.has("q1_1-Comment")).toBe(true);
    expect(keys.has("q2_1-Comment")).toBe(true);
    expect(keys.has("q1_3-Comment")).toBe(false);
  });
  it("excludes the honeypot and panel names", () => {
    expect(HONEYPOT).toBe("hp_field");
    expect(keys.has(HONEYPOT)).toBe(false);
    expect(keys.has("q2_6")).toBe(false);
  });
  it("contains the free-text follow-ups of every rating section", () => {
    for (let i = 1; i <= 6; i++) expect(keys.has(`q3_${i}_other`)).toBe(true);
  });
});

describe("2.6 size questions", () => {
  const all: El[] = [];
  type El = { type: string; name: string; inputType?: unknown; min?: unknown; elements?: El[] };
  const walk = (els: El[]) => els.forEach((e) => (all.push(e), e.elements && walk(e.elements)));
  for (const page of def.survey.pages) walk(page.elements);

  it("are number text questions whose range lives only in the sliders map", () => {
    for (const name of Object.keys(def.sliders)) {
      const q = all.find((e) => e.name === name);
      expect(q?.type).toBe("text");
      expect(q?.inputType).toBe("number");
      expect(q?.min).toBeUndefined();
    }
    expect(Object.keys(def.sliders)).toEqual(["q2_6_snapshots", "q2_6_buses", "q2_6_components"]);
  });
});

describe("q2_3 per-choice comments", () => {
  it("have no -Comment key; answers are objects inside q2_3", () => {
    const keys = allowedAnswerKeys(def);
    expect(keys.has("q2_3")).toBe(true);
    expect(keys.has("q2_3-Comment")).toBe(false);
  });
});
