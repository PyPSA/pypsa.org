// Imported dynamically so SurveyJS and its CSS load only on /survey.
import "survey-core/survey-core.css";
import "survey-core/themes/adapters/shadcn-default.css";
import "./theme.css";
import { renderSurvey, unmountComponentAtNode } from "survey-js-ui";
import { Question, type Model } from "survey-core";
import { attachSubmitGuard, type SubmitState } from "./complete";
import { createSurvey, jumpToPage, setVisible, startSurvey, top3State } from "./model";
import { openStorage, type OpenedStorage } from "./storage";
import { registerLogSlider } from "./log-slider";
import { submitResponse } from "./submit";
import type { WaveDefinition } from "./wave";

export type { SubmitState };

/** Where the respondent is, for the section list and the progress strip. */
export interface NavState {
  titles: string[];
  current: number;
  /** The furthest page reached. Every page up to it can be jumped to. */
  reached: number;
}

export interface MountHooks {
  onSubmitState: (state: SubmitState) => void;
  onCompleted: () => void;
  /** A submit stopped on an invalid page, which is now the current one. */
  onInvalid: (pageIndex: number) => void;
  onSaveError: () => void;
  /** The current page changed (also fires once at mount). */
  onPage: (state: NavState) => void;
}

export interface MountedSurvey {
  /** Runs the submit again after a retryable error. */
  retry: () => void;
  /**
   * Shows a page up to the furthest one reached, returning false when a forward jump failed validation.
   */
  goTo: (index: number) => boolean;
  destroy: () => void;
}

// SurveyJS focuses a question's input when its title or description is clicked, with no setting to
// turn it off. Keep only the base check, so collapsible elements still toggle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Question.prototype as any).needClickTitleFunction = function (this: Question) {
  return this.state !== "default" && this.state !== "collapsed";
};

/** Creates the model (restoring saved progress) and renders it into `container`. */
export function mountSurvey(
  container: HTMLElement,
  def: WaveDefinition,
  hooks: MountHooks,
  { fresh, opened = openStorage(() => localStorage) }: { fresh: boolean; opened?: OpenedStorage }
): MountedSurvey {
  registerLogSlider(def);
  opened.onFallback(hooks.onSaveError);
  const model: Model = createSurvey(def, {
    storage: opened.storage,
    random: Math.random,
    now: () => new Date(),
    onSaveError: hooks.onSaveError,
  });
  model.showCompletedPage = false;
  // The page scrolls and focuses itself in showPage.
  model.autoFocusFirstQuestion = false;
  model.onScrollingElementToTop.add((_, o) => {
    o.cancel = true;
  });
  if (fresh) startSurvey(model);
  const onVisibility = () => setVisible(model, !document.hidden);
  document.addEventListener("visibilitychange", onVisibility);
  if (document.hidden) onVisibility();

  attachSubmitGuard(model, hooks, submitResponse);

  // ponytail: reached starts at the restored page, pages seen beyond it before a reload are forgotten.
  let reached = model.currentPageNo;
  const emitNav = () => {
    reached = Math.max(reached, model.currentPageNo);
    hooks.onPage({
      titles: model.visiblePages.map((p) => p.title),
      current: model.currentPageNo,
      reached,
    });
  };
  model.onCurrentPageChanged.add(emitNav);
  emitNav();

  const counterText = {
    q2_9: (n: number) => `Top 3: ${n} of 3`,
    q3_7: (n: number) => `${n} of 3 picked`,
  } as const;
  // Writes the counter and dims the options that locked once three are picked.
  const syncLimit = (name: "q2_9" | "q3_7") => {
    const root = container.querySelector<HTMLElement>(`[data-name="${name}"]`);
    if (!root) return;
    const { picked } = top3State(model, name);
    const counter = root.querySelector(".survey-top3-counter");
    if (counter) counter.textContent = counterText[name](picked);
    root.querySelectorAll(".sd-selectbase__item").forEach((el) => {
      el.classList.toggle("is-full", !!el.querySelector("input:disabled"));
    });
  };
  model.onAfterRenderPage.add((_, o) => {
    const title = o.htmlElement.querySelector(".sd-page__title");
    title?.setAttribute("role", "heading");
    title?.setAttribute("aria-level", "2");
  });
  model.onAfterRenderQuestion.add((_, o) => {
    const heading = o.htmlElement.querySelector(".sd-question__title");
    heading?.setAttribute("role", "heading");
    heading?.setAttribute("aria-level", "3");
    const name = o.question.name;
    if (name !== "q2_9" && name !== "q3_7") return;
    const title = o.htmlElement.querySelector("h5, .sd-question__title");
    if (title && !o.htmlElement.querySelector(".survey-top3-counter")) {
      const counter = document.createElement("span");
      counter.className = "survey-top3-counter";
      title.after(counter);
    }
    syncLimit(name);
  });
  // The DOM updates after the value event, so refresh on the next frame.
  model.onValueChanged.add((_, o) => {
    const name = o.name;
    if (name === "q2_9" || name === "q3_7") requestAnimationFrame(() => syncLimit(name));
  });

  renderSurvey(model, container);
  return {
    retry: () => model.completeLastPage(),
    goTo: (index) => jumpToPage(model, index, reached),
    destroy: () => {
      document.removeEventListener("visibilitychange", onVisibility);
      unmountComponentAtNode(container);
      model.dispose();
    },
  };
}
