import { describe, expect, it } from "vitest";
import { openStorage } from "../../src/lib/survey/storage";
import { createSurvey, buildPayload, clearProgress } from "../../src/lib/survey/model";
import { mulberry32 } from "../../src/lib/survey/random";
import { waves } from "../../src/lib/survey/wave";

const def = waves["2026-h2"];

function fake(over: Partial<Storage> = {}): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    ...over,
  } as unknown as Storage;
}
const boom = () => {
  throw new Error("blocked");
};

describe("openStorage", () => {
  it("passes through to the browser storage", () => {
    const backing = fake();
    const o = openStorage(() => backing);
    o.storage.setItem("a", "1");
    expect(backing.getItem("a")).toBe("1");
    expect(o.persistent()).toBe(true);
  });
  it("falls back once, seeded with what was read, and fires the callback once", () => {
    let fail = false;
    const backing = fake({
      getItem: ((k: string) => (fail ? boom() : k === "a" ? "1" : null)) as never,
    });
    const o = openStorage(() => backing);
    let calls = 0;
    o.onFallback(() => calls++);
    expect(o.storage.getItem("a")).toBe("1");
    fail = true;
    expect(o.storage.getItem("b")).toBeNull();
    expect(o.persistent()).toBe(false);
    expect(o.storage.getItem("a")).toBe("1");
    o.storage.setItem("c", "3");
    o.storage.removeItem("a");
    expect(o.storage.getItem("c")).toBe("3");
    expect(o.storage.getItem("a")).toBeNull();
    expect(calls).toBe(1);
  });
  it("falls back when the getter throws", () => {
    const o = openStorage(boom);
    o.storage.setItem("a", "1");
    expect(o.storage.getItem("a")).toBe("1");
    expect(o.persistent()).toBe(false);
  });
  it("runs a callback registered after the fallback", () => {
    const o = openStorage(boom);
    o.storage.getItem("a");
    let called = false;
    o.onFallback(() => (called = true));
    expect(called).toBe(true);
  });
  it("still yields a working model and a completed survey when every method throws", () => {
    const o = openStorage(() => fake({ getItem: boom, setItem: boom, removeItem: boom }));
    const model = createSurvey(def, {
      storage: o.storage,
      random: () => 0.4,
      now: () => new Date(),
    });
    model.setValue("q1_1", "ngo");
    expect(o.persistent()).toBe(false);
    expect(buildPayload(model).answers.q1_1).toBe("ngo");
    clearProgress(model);
    expect(o.storage.getItem(`pypsa-survey:${def.wave}`)).toBeNull();
  });
});

describe("mulberry32", () => {
  it("is deterministic per seed and stays in [0, 1)", () => {
    const a = mulberry32(7);
    const b = mulberry32(7);
    const xs = Array.from({ length: 50 }, a);
    expect(xs).toEqual(Array.from({ length: 50 }, b));
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
    expect(mulberry32(8)()).not.toBe(xs[0]);
  });
});
