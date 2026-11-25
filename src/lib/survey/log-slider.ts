// Browser-only, call once before the survey renders.
import { CustomWidgetCollection, type Model, type Question } from "survey-core";
import { NOTCHES_PER_DECADE, logStep, logToValue, valueToLog } from "./log-slider-math";
import { holdSaves } from "./model";
import type { WaveDefinition } from "./wave";

const STEPS = 1000;
const WIDGET = "pypsa-log-slider";

export function registerLogSlider(def: Pick<WaveDefinition, "sliders">): void {
  if (CustomWidgetCollection.Instance.getCustomWidgetByName(WIDGET)) return;
  CustomWidgetCollection.Instance.add({
    name: WIDGET,
    widgetIsLoaded: () => true,
    isFit: (question: { getType(): string; name: string }) =>
      question.getType() === "text" && question.name in def.sliders,
    isDefaultRender: true,
    afterRender: (question: Question, el: HTMLElement) => {
      const cfg = def.sliders[question.name as string];
      const number = el.matches("input") ? el : el.querySelector("input");
      if (!cfg || !number) return;
      // SurveyJS draws the input border on a wrapper, so the slider goes above that wrapper.
      const host = number.closest(".sd-formbox") ?? number;
      if (!host.parentElement) return;
      const wrap = document.createElement("div");
      wrap.className = "log-slider";
      const range = document.createElement("input");
      range.type = "range";
      range.min = "0";
      range.max = String(STEPS);
      range.step = "1";
      range.setAttribute("aria-label", String(question.title));
      if (number instanceof HTMLInputElement && !number.placeholder)
        number.placeholder = "Type a number or use the slider";
      const label = document.createElement("span");
      label.className = "log-slider-scale";
      const fmt = (n: number) => n.toLocaleString("en");
      label.textContent = `${fmt(cfg.min)} to ${fmt(cfg.max)}${cfg.orMore ? " or more" : ""}`;
      const sync = () => {
        const empty = question.value === undefined || question.value === "";
        wrap.classList.toggle("log-slider--empty", empty);
        range.value = String(
          empty ? 0 : Math.round(valueToLog(Number(question.value), cfg) * STEPS)
        );
        range.style.setProperty("--fill", `${(Number(range.value) / STEPS) * 100}%`);
      };
      range.addEventListener("input", () => {
        question.value = logToValue(Number(range.value) / STEPS, cfg);
      });
      // One notch per arrow press, a decade per PageUp/PageDown, instead of 1/1000th of the track.
      const KEY_NOTCHES: Record<string, number> = {
        ArrowUp: 1,
        ArrowRight: 1,
        ArrowDown: -1,
        ArrowLeft: -1,
        PageUp: NOTCHES_PER_DECADE,
        PageDown: -NOTCHES_PER_DECADE,
      };
      range.addEventListener("keydown", (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        let next: number;
        if (e.key === "Home") next = cfg.min;
        else if (e.key === "End") next = cfg.max;
        else if (e.key in KEY_NOTCHES)
          next = logStep(Number(question.value), cfg, KEY_NOTCHES[e.key]);
        else return;
        e.preventDefault();
        question.value = next;
      });
      // A drag fires many input events, so saving waits for its end.
      const model = question.survey as Model;
      const hold = (on: boolean) => () => model && holdSaves(model, on);
      range.addEventListener("pointerdown", hold(true));
      range.addEventListener("pointerup", hold(false));
      range.addEventListener("pointercancel", hold(false));
      range.addEventListener("lostpointercapture", hold(false));
      range.addEventListener("change", hold(false));
      host.parentElement.insertBefore(wrap, host);
      wrap.append(range, label);
      sync();
      question.registerFunctionOnPropertyValueChanged("value", sync, WIDGET);
    },
    willUnmount: (question: Question) => {
      question.unRegisterFunctionOnPropertyValueChanged("value", WIDGET);
    },
  });
}
