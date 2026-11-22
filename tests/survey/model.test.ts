import { describe, expect, it } from "vitest";
import {
  HONEYPOT,
  MAX_TEXT_LENGTH,
  allowedAnswerKeys,
  isOpen,
  waves,
} from "../../src/lib/survey/wave";
import {
  buildPayload,
  clearProgress,
  firstInvalidPage,
  top3State,
  validatePage,
  createSurvey,
  holdSaves,
  jumpToPage,
  setVisible,
  SavedProgressError,
  hasSavedProgress,
  resetProgress,
  startSurvey,
  type SurveyStorage,
} from "../../src/lib/survey/model";
import { openStorage } from "../../src/lib/survey/storage";
import { logToValue, valueToLog } from "../../src/lib/survey/log-slider-math";

/* eslint-disable @typescript-eslint/no-explicit-any */
const def = waves["2026-h2"];

function memoryStorage(): SurveyStorage & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

/** Deterministic pseudo random generator for a seed. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function make(opts: { storage?: SurveyStorage; seed?: number; now?: () => Date } = {}) {
  const storage = opts.storage ?? memoryStorage();
  const model = createSurvey(def, {
    storage,
    random: seeded(opts.seed ?? 1),
    now: opts.now ?? (() => new Date("2026-12-01T10:00:00Z")),
  });
  return { model, storage };
}

class FakeStorage {
  private map = new Map<string, string>();
  getItem = (k: string) => this.map.get(k) ?? null;
  setItem = (k: string, v: string) => void this.map.set(k, v);
  removeItem = (k: string) => void this.map.delete(k);
}

const q = (m: any, n: string) => m.getQuestionByName(n) ?? m.getPanelByName(n);

describe("not used in 1.3", () => {
  const hidden = [
    "q2_2",
    "q2_3",
    "q2_4",
    "q2_5",
    "q2_6",
    "q2_7",
    "q2_8",
    "q2_9",
    "q3_6_1",
    "q3_6_2",
    "q3_6_3",
  ];
  it("hides 2.2 to 2.9 and 3.6.1 to 3.6.3 and keeps 1.4", () => {
    const { model } = make();
    model.setValue("q1_3", "not_used");
    for (const n of hidden) expect(q(model, n).isVisible, n).toBe(false);
    expect(q(model, "q1_4").isVisible).toBe(true);
  });
  it("shows them for any other answer", () => {
    const { model } = make();
    model.setValue("q1_3", "lt_1y");
    for (const n of hidden) expect(q(model, n).isVisible, n).toBe(true);
    expect(q(model, "q1_4").isVisible).toBe(true);
  });
  it("rewords 2.1 and restores the title", () => {
    const { model } = make();
    const normal = q(model, "q2_1").title;
    model.setValue("q1_3", "not_used");
    expect(q(model, "q2_1").title).toBe(def.nonUser.q2_1Title);
    model.setValue("q1_3", "gt_5y");
    expect(q(model, "q2_1").title).toBe(normal);
  });
  it("keeps the 2.6 sizes out of the payload of a non-user", () => {
    const { model } = make();
    model.setValue("q1_3", "lt_1y");
    model.setValue("q2_6_buses", 50);
    model.setValue("q2_5", "never");
    model.setValue("q1_3", "not_used");
    const { answers } = buildPayload(model);
    expect(answers).not.toHaveProperty("q2_6_buses");
    expect(answers).not.toHaveProperty("q2_5");
    expect(answers.q1_3).toBe("not_used");
  });
});

describe("Part 3 pages", () => {
  const sectionPages = (m: any) =>
    m.pages.map((p: any) => p.name).filter((n: string) => /^p3_[1-6]$/.test(n));
  it("shows all six sections to everyone, 3.7 last in Part 3", () => {
    const { model } = make();
    model.setValue("q1_3", "not_used");
    const names = model.visiblePages.map((p: any) => p.name);
    expect(sectionPages(model).sort()).toEqual(def.sections.map((s) => s.page).sort());
    expect(names.indexOf("p3_7")).toBe(
      names.indexOf(names.filter((n: string) => /^p3_[1-6]$/.test(n)).pop()!) + 1
    );
    expect(names[names.length - 1]).toBe("part4");
    expect(names.slice(0, 2)).toEqual(["part1", "part2"]);
  });
  it("sends a permutation as section_order that matches the shown order", () => {
    const { model } = make();
    const order = buildPayload(model).section_order;
    expect([...order].sort()).toEqual(def.sections.map((s) => s.id).sort());
    const shown = sectionPages(model).map(
      (p: string) => def.sections.find((s) => s.page === p)!.id
    );
    expect(order).toEqual(shown);
  });
  it("is stable across a reload and differs across respondents", () => {
    const storage = memoryStorage();
    const first = make({ storage, seed: 5 });
    first.model.setValue("q1_1", "ngo");
    const orderA = buildPayload(first.model).section_order;
    const reloaded = make({ storage, seed: 99 });
    expect(buildPayload(reloaded.model).section_order).toEqual(orderA);
    const orders = new Set<string>();
    for (let seed = 1; seed <= 8; seed++)
      orders.add(buildPayload(make({ seed }).model).section_order.join());
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("seeded random orders", () => {
  const texts = (m: any, n: string, kind: "choices" | "rows") =>
    q(m, n)[kind].map((x: any) => x.value ?? x.item?.value);
  const orders = (m: any) => [
    buildPayload(m).section_order.join(),
    texts(m, "q2_1", "choices").join(),
    texts(m, "q2_9", "rows").join(),
    texts(m, "q3_1", "rows").join(),
    texts(m, "q3_7", "choices").join(),
  ];
  it("gives identical section, row and choice orders for the same storage", () => {
    const storage = memoryStorage();
    const first = make({ storage, seed: 5 });
    first.model.setValue("q1_1", "ngo");
    const again = make({ storage, seed: 99 });
    expect(orders(again.model)).toEqual(orders(first.model));
  });
  it("gives different orders for different seeds", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 4; seed++) seen.add(orders(make({ seed }).model).join("|"));
    expect(seen.size).toBeGreaterThan(1);
    expect(orders(make({ seed: 1 }).model)[1]).not.toBe(
      def.survey.pages
        .flatMap((p) => p.elements)
        .find((e) => e.name === "q2_1")!
        .choices!.map((c) => c.value)
        .join()
    );
  });
  it("does not send the seed", () => {
    expect(JSON.stringify(buildPayload(make().model))).not.toContain("seed");
  });
});

describe("validation", () => {
  it("required questions block navigation", () => {
    const { model } = make();
    expect(model.nextPage()).toBe(false);
    expect(model.currentPageNo).toBe(0);
    model.setValue("q1_1", "ngo");
    model.setValue("q1_2", "de");
    expect(model.nextPage()).toBe(true);
  });
  it("rating rows are optional", () => {
    const { model } = make();
    model.currentPage = model.getPageByName("p3_1");
    expect(model.nextPage()).toBe(true);
  });
  const top3 = (n: number) =>
    Object.fromEntries(
      def.survey.pages
        .find((p) => p.name === "part2")!
        .elements.find((e) => e.name === "q2_9")!
        .rows!.slice(0, n)
        .map((r) => [r.value, { top3: ["yes"] }])
    );
  it("rejects a fourth Top 3 tick in 2.9 with the exact text", () => {
    const { model } = make();
    model.setValue("q1_3", "lt_1y");
    model.setValue("q2_9", top3(4));
    expect(q(model, "q2_9").hasErrors()).toBe(true);
    expect(q(model, "q2_9").errors.map((e: any) => e.getText())).toContain(
      "Mark at most three features as Top 3 (you marked 4)."
    );
  });
  it("rejects a 2.6 number over the slider max with the exact text", () => {
    const { model } = make();
    model.setValue("q1_3", "lt_1y");
    const { max } = def.sliders.q2_6_buses;
    model.setValue("q2_6_buses", max + 1);
    expect(q(model, "q2_6_buses").hasErrors()).toBe(true);
    expect(q(model, "q2_6_buses").errors.map((e: any) => e.getText())).toContain(
      `Enter ${max.toLocaleString("en-US")} for ${max.toLocaleString("en-US")} or more.`
    );
    model.setValue("q2_6_buses", max);
    expect(q(model, "q2_6_buses").hasErrors()).toBe(false);
  });
  it("rejects a negative 2.6 number in the form", () => {
    const { model } = make();
    model.setValue("q1_3", "lt_1y");
    for (const name of Object.keys(def.sliders)) {
      model.setValue(name, -5);
      expect(q(model, name).hasErrors()).toBe(true);
      model.setValue(name, 0);
      expect(q(model, name).hasErrors()).toBe(false);
    }
  });
  it("rejects text over the Worker cap in the form, and accepts text at the cap", () => {
    const { model } = make();
    model.setValue("q1_3", "lt_1y");
    for (const name of ["q4_1", "q4_4", "q3_1_other"]) {
      model.setValue(name, "x".repeat(MAX_TEXT_LENGTH + 1));
      expect(q(model, name).hasErrors(), name).toBe(true);
      model.setValue(name, "x".repeat(MAX_TEXT_LENGTH));
      expect(q(model, name).hasErrors(), name).toBe(false);
    }
    model.setValue("q1_1", "other");
    model.setValue("q1_1-Comment", "x".repeat(MAX_TEXT_LENGTH + 1));
    expect(q(model, "q1_1").hasErrors()).toBe(true);
    model.setValue("q2_3", [{ value: "workflow", comment: "x".repeat(MAX_TEXT_LENGTH + 1) }]);
    expect(q(model, "q2_3").hasErrors()).toBe(true);
  });
  it("accepts three Top 3 ticks in 2.9", () => {
    const { model } = make();
    model.setValue("q1_3", "lt_1y");
    model.setValue("q2_9", top3(3));
    expect(q(model, "q2_9").hasErrors()).toBe(false);
  });
  const picks = (n: number) =>
    q(make().model, "q3_7")
      .choices.slice(0, n)
      .map((c: any) => c.value);
  it("rejects a fourth pick in 3.7 with the exact text", () => {
    const { model } = make();
    model.setValue("q3_7", picks(4));
    expect(q(model, "q3_7").hasErrors()).toBe(true);
    expect(q(model, "q3_7").errors.map((e: any) => e.getText())).toContain(
      "Pick at most three features (you picked 4)."
    );
  });
  it("accepts three picks in 3.7", () => {
    const { model } = make();
    model.setValue("q3_7", picks(3));
    expect(q(model, "q3_7").hasErrors()).toBe(false);
  });
});

describe("row explanations", () => {
  it("renders a muted explanation line under each 3.x row title", () => {
    const { model } = make();
    const src = def.survey.pages
      .find((p) => p.name === "p3_1")!
      .elements[0].rows!.find((r) => r.description)!;
    const row = q(model, "q3_1").visibleRows.find((r: any) => r.item.value === src.value);
    const html = row.locText.renderedHtml as string;
    expect(src).toBeDefined();
    expect(html).toContain(`<span class="rowdesc">`);
    expect(html).toContain(src.description!.replace(/&/g, "&amp;"));
  });
});

describe("payload", () => {
  it("has the metadata and only known question names, without the honeypot", () => {
    const { model } = make();
    model.setValue("q1_1", "ngo");
    model.setValue(HONEYPOT, "http://spam");
    model.setValue("q1_3", "lt_1y");
    model.setValue("q2_1", ["other"]);
    model.setValue("q2_1-Comment", "x");
    const p = buildPayload(model);
    expect(p).toMatchObject({ wave: def.wave, version: def.version });
    expect(typeof p.seconds).toBe("number");
    expect(p.section_order).toHaveLength(6);
    expect(p.hp_field).toBe("http://spam");
    expect(p.answers).not.toHaveProperty(HONEYPOT);
    const allowed = allowedAnswerKeys(def);
    for (const k of Object.keys(p.answers)) expect(allowed.has(k), k).toBe(true);
    expect(p.answers.q1_1).toBe("ngo");
    expect(p.answers["q2_1-Comment"]).toBe("x");
  });
  it("counts seconds only while the tab is visible, from Start", () => {
    let t = Date.parse("2026-12-01T10:00:00Z");
    const { model } = make({ now: () => new Date(t) });
    t += 5000;
    startSurvey(model);
    t += 30_000;
    setVisible(model, false);
    t += 600_000;
    setVisible(model, true);
    t += 60_000;
    expect(buildPayload(model).seconds).toBe(90);
  });
  it("clamps seconds to seven days", () => {
    let t = Date.parse("2026-12-01T10:00:00Z");
    const { model } = make({ now: () => new Date(t) });
    startSurvey(model);
    t += 30 * 86_400_000;
    expect(buildPayload(model).seconds).toBe(604800);
  });
  it("keeps active time across a reload", () => {
    let t = Date.parse("2026-12-01T10:00:00Z");
    const storage = memoryStorage();
    const first = make({ storage, now: () => new Date(t) });
    startSurvey(first.model);
    t += 40_000;
    first.model.setValue("q1_1", "ngo");
    t += 1_000_000;
    const reloaded = make({ storage, now: () => new Date(t) });
    t += 20_000;
    expect(buildPayload(reloaded.model).seconds).toBe(60);
  });
  it("puts the honeypot question on the first page", () => {
    const { model } = make();
    expect(model.pages[0].getQuestionByName(HONEYPOT)).toBeTruthy();
  });
});

describe("progress", () => {
  it("saves answers and page, restores them, and clears on success", () => {
    const storage = memoryStorage();
    expect(hasSavedProgress(def, storage)).toBe(false);
    const a = make({ storage });
    a.model.setValue("q1_1", "ngo");
    a.model.setValue("q1_2", "de");
    a.model.nextPage();
    expect(storage.map.has("pypsa-survey:2026-h2")).toBe(true);
    expect(hasSavedProgress(def, storage)).toBe(true);
    const b = make({ storage });
    expect(b.model.getValue("q1_1")).toBe("ngo");
    expect(b.model.currentPageNo).toBe(1);
    clearProgress(b.model);
    expect(hasSavedProgress(def, storage)).toBe(false);
    b.model.setValue("q1_1", "utility");
    expect(storage.map.size).toBe(0);
  });
  it("clears the progress from a real in-memory storage after a successful submit", () => {
    const opened = openStorage(() => new FakeStorage() as unknown as Storage);
    const model = createSurvey(def, {
      storage: opened.storage,
      random: seeded(1),
      now: () => new Date(),
    });
    model.setValue("q1_1", "ngo");
    expect(hasSavedProgress(def, opened.storage)).toBe(true);
    clearProgress(model);
    expect(hasSavedProgress(def, opened.storage)).toBe(false);
  });
  it("never stores a filled honeypot", () => {
    const { model, storage } = make();
    model.setValue(HONEYPOT, "http://spam");
    model.setValue("q1_1", "ngo");
    const raw = (storage as any).map.get("pypsa-survey:2026-h2");
    expect(JSON.parse(raw).data).not.toHaveProperty(HONEYPOT);
    expect(raw).not.toContain("spam");
  });
  it("defers saves while held and flushes once on release", () => {
    const { model, storage } = make();
    holdSaves(model, true);
    model.setValue("q1_1", "ngo");
    expect((storage as any).map.size).toBe(0);
    holdSaves(model, false);
    expect(JSON.parse((storage as any).map.get("pypsa-survey:2026-h2")).data.q1_1).toBe("ngo");
  });
  it("saves active time when visibility changes", () => {
    const { model, storage } = make();
    setVisible(model, false);
    expect((storage as any).map.has("pypsa-survey:2026-h2")).toBe(true);
  });
  it("fails loudly on corrupt saved progress and recovers after a reset", () => {
    const storage = memoryStorage();
    storage.setItem("pypsa-survey:2026-h2", "{not json");
    expect(() => hasSavedProgress(def, storage)).toThrow(SavedProgressError);
    expect(() => make({ storage })).toThrow(SavedProgressError);
    resetProgress(def, storage);
    expect(hasSavedProgress(def, storage)).toBe(false);
    expect(() => make({ storage })).not.toThrow();
  });
  it("fails loudly on saved progress of the wrong shape", () => {
    for (const bad of [
      "null",
      "{}",
      '{"data":{},"order":["x"]}',
      '{"data":{},"currentPageNo":0,"seed":-1,"activeMs":0}',
      '{"data":{},"currentPageNo":0,"seed":1.5,"activeMs":0}',
      '{"data":{},"currentPageNo":0,"seed":1,"activeMs":null}',
    ]) {
      const storage = memoryStorage();
      storage.setItem("pypsa-survey:2026-h2", bad);
      expect(() => hasSavedProgress(def, storage), bad).toThrow(SavedProgressError);
    }
  });
  it("reports storage write failures through onSaveError", () => {
    const failure = new Error("quota");
    const errors: unknown[] = [];
    const storage = {
      ...memoryStorage(),
      setItem: () => {
        throw failure;
      },
    };
    const model = createSurvey(def, {
      storage,
      random: seeded(1),
      now: () => new Date("2026-12-01T10:00:00Z"),
      onSaveError: (e) => errors.push(e),
    });
    model.setValue("q1_1", "ngo");
    expect(errors).toEqual([failure]);
    expect(model.getValue("q1_1")).toBe("ngo");
  });
  it("throws for a model not created by createSurvey", () => {
    const foreign = new (make().model.constructor as any)({ pages: [] });
    expect(() => startSurvey(foreign)).toThrow();
    expect(() => clearProgress(foreign)).toThrow();
    expect(() => buildPayload(foreign)).toThrow();
  });
});

describe("open window", () => {
  it("is closed before, open inside and closed after", () => {
    expect(isOpen(def, new Date(Date.parse(def.opens) - 1))).toBe(false);
    expect(isOpen(def, new Date(Date.parse(def.opens)))).toBe(true);
    expect(isOpen(def, new Date(Date.parse(def.closes) - 1))).toBe(true);
    expect(isOpen(def, new Date(Date.parse(def.closes)))).toBe(false);
  });
});

describe("log slider mapping", () => {
  const cfg = { min: 1, max: 100000 };
  it("maps the ends and the middle", () => {
    expect(logToValue(0, cfg)).toBe(1);
    expect(logToValue(1, cfg)).toBe(100000);
    expect(logToValue(0.5, cfg)).toBe(316);
  });
  it("round-trips and clamps", () => {
    expect(valueToLog(100, cfg)).toBeCloseTo(0.4, 5);
    expect(valueToLog(10_000_000, cfg)).toBe(1);
    expect(valueToLog(0, cfg)).toBe(0);
  });
});

describe("top 3 limits and 3.6.1 exclusivity", () => {
  const rowsOf = (n: number) =>
    def.survey.pages
      .find((p) => p.name === "part2")!
      .elements.find((e) => e.name === "q2_9")!
      .rows!.slice(0, n)
      .map((r) => r.value as string);
  const cell = (model: any, row: string) =>
    q(model, "q2_9")
      .visibleRows.find((r: any) => r.rowName === row)
      .cells.find((c: any) => c.column.name === "top3").question;

  it("top3State counts rows with a Top 3 tick", () => {
    const { model } = make();
    model.setValue("q1_3", "lt_1y");
    expect(top3State(model, "q2_9")).toEqual({ picked: 0, full: false });
    model.setValue("q2_9", Object.fromEntries(rowsOf(3).map((r) => [r, { top3: ["yes"] }])));
    expect(top3State(model, "q2_9")).toEqual({ picked: 3, full: true });
    const choices = q(model, "q3_7").choices.map((c: any) => c.value);
    model.setValue("q3_7", choices.slice(0, 2));
    expect(top3State(model, "q3_7")).toEqual({ picked: 2, full: false });
  });

  it("makes the other Top 3 cells read only at three, and frees them on untick", () => {
    const { model } = make();
    model.setValue("q1_3", "lt_1y");
    const rows = rowsOf(4);
    for (const r of rows.slice(0, 3)) cell(model, r).value = ["yes"];
    expect(cell(model, rows[3]).isReadOnly).toBe(true);
    expect(cell(model, rows[3]).choices[0].isEnabled).toBe(false);
    expect(cell(model, rows[0]).isReadOnly).toBe(false);
    expect(cell(model, rows[0]).choices[0].isEnabled).toBe(true);
    cell(model, rows[0]).value = [];
    expect(cell(model, rows[3]).isReadOnly).toBe(false);
    expect(cell(model, rows[3]).choices[0].isEnabled).toBe(true);
  });

  it("ticking No in 3.6.1 clears the other picks and hides 3.6.2", () => {
    const { model } = make();
    model.setValue("q1_3", "lt_1y");
    const q1 = q(model, "q3_6_1");
    q1.renderedValue = ["memory"];
    expect(q(model, "q3_6_2").isVisible).toBe(true);
    q1.renderedValue = ["memory", "no"];
    expect(model.getValue("q3_6_1")).toEqual(["no"]);
    expect(q(model, "q3_6_2").isVisible).toBe(false);
  });

  it("firstInvalidPage finds the page and validatePage shows its errors", () => {
    const { model } = make();
    expect(firstInvalidPage(model)).toBe(0);
    model.setValue("q1_1", "ngo");
    model.setValue("q1_2", "de");
    expect(firstInvalidPage(model)).toBe(-1);
    expect(validatePage(model, 0)).toBe(true);
    model.setValue("q1_1", undefined);
    expect(validatePage(model, 0)).toBe(false);
    expect(q(model, "q1_1").errors.length).toBeGreaterThan(0);
  });

  it("jumpToPage validates forward jumps, lets backward jumps through and stops past reached", () => {
    const { model } = make();
    expect(jumpToPage(model, 1, 1)).toBe(false);
    expect(model.currentPageNo).toBe(0);
    expect(q(model, "q1_1").errors.length).toBeGreaterThan(0);
    model.setValue("q1_1", "ngo");
    model.setValue("q1_2", "de");
    expect(jumpToPage(model, 2, 1)).toBe(false);
    expect(jumpToPage(model, 1, 1)).toBe(true);
    expect(model.currentPageNo).toBe(1);
    model.setValue("q1_1", undefined);
    expect(jumpToPage(model, 0, 1)).toBe(true);
    expect(model.currentPageNo).toBe(0);
  });
});
