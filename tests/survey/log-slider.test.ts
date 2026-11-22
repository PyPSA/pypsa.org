// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Model } from "survey-core";
import { waves } from "../../src/lib/survey/wave";
import { registerLogSlider } from "../../src/lib/survey/log-slider";
import { logStep } from "../../src/lib/survey/log-slider-math";

/* eslint-disable @typescript-eslint/no-explicit-any */
const def = waves["2026-h2"];
const name = Object.keys(def.sliders)[0];
const cfg = def.sliders[name];

function render() {
  registerLogSlider(def);
  const model = new Model(def.survey);
  const question = model.getQuestionByName(name);
  const host = document.createElement("div");
  const number = document.createElement("input");
  number.type = "number";
  host.append(number);
  document.body.append(host);
  const widget = (question as any).customWidget;
  return { model, question: question as any, host, number, widget };
}

describe("log slider widget", () => {
  it("is attached to the 2.6 text questions only", () => {
    registerLogSlider(def);
    const model = new Model(def.survey);
    for (const key of Object.keys(def.sliders)) {
      expect((model.getQuestionByName(key) as any).customWidget?.name).toBe("pypsa-log-slider");
    }
    expect((model.getQuestionByName("q1_1") as any).customWidget).toBeFalsy();
  });

  it("stores a number when the slider moves and follows typed numbers", () => {
    const { question, host, number, widget } = render();
    widget.afterRender(question, number);
    const range = host.querySelector<HTMLInputElement>("input[type=range]")!;
    expect(range).toBeTruthy();

    range.value = "1000";
    range.dispatchEvent(new Event("input"));
    expect(typeof question.value).toBe("number");
    expect(question.value).toBe(cfg.max);

    question.value = cfg.min;
    expect(Number(range.value)).toBe(0);
    question.value = cfg.max;
    expect(Number(range.value)).toBe(1000);
  });

  it("does not replace an existing valueChangedCallback and stops syncing on unmount", () => {
    const { question, host, number, widget } = render();
    const calls: unknown[] = [];
    question.valueChangedCallback = () => calls.push(1);
    widget.afterRender(question, number);
    const range = host.querySelector<HTMLInputElement>("input[type=range]")!;
    question.value = cfg.max;
    expect(calls.length).toBeGreaterThan(0);
    widget.willUnmount(question);
    question.value = cfg.min;
    expect(Number(range.value)).toBe(1000);
  });
});

describe("logStep", () => {
  const r = { min: 1, max: 10000 };
  it("moves a decade in 20 notches", () => {
    expect(logStep(1, r, 20)).toBe(10);
    expect(logStep(10, r, 20)).toBe(100);
    expect(logStep(100, r, -20)).toBe(10);
    expect(logStep(10, r, -20)).toBe(1);
  });
  it("always moves at least one whole number", () => {
    expect(logStep(1, r, 1)).toBe(2);
    expect(logStep(2, r, -1)).toBe(1);
  });
  it("clamps at min and max", () => {
    expect(logStep(1, r, -1)).toBe(1);
    expect(logStep(10000, r, 1)).toBe(10000);
    expect(logStep(5000, r, 40)).toBe(10000);
  });
  it("treats 0 as below the range", () => {
    expect(logStep(0, r, 1)).toBe(1);
    expect(logStep(0, r, -1)).toBe(1);
    expect(logStep(0, { min: 10, max: 1000 }, 21)).toBe(100);
  });
});
