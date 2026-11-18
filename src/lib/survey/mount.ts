// Imported dynamically so SurveyJS and its CSS load only on /survey.
import "survey-core/survey-core.css";
import "survey-core/themes/adapters/shadcn-default.css";
import "./theme.css";
import { renderSurvey } from "survey-js-ui";
import { Question, type Model } from "survey-core";
import { attachSubmitGuard, type SubmitState } from "./complete";
import { createSurvey, startSurvey } from "./model";
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
  onSaveError: () => void;
  onNav: (state: NavState) => void;
}

export interface MountedSurvey {
  /** Runs the submit again after a retryable error. */
  retry: () => void;
  /** Shows a page up to the furthest one reached. */
  goTo: (index: number) => void;
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
  { fresh }: { fresh: boolean }
): MountedSurvey {
  registerLogSlider(def);
  const model: Model = createSurvey(def, {
    storage: localStorage,
    random: Math.random,
    now: () => new Date(),
    onSaveError: hooks.onSaveError,
  });
  model.showCompletedPage = false;
  if (fresh) startSurvey(model);

  attachSubmitGuard(model, hooks, submitResponse);

  // ponytail: reached starts at the restored page, pages seen beyond it before a reload are forgotten.
  let reached = model.currentPageNo;
  const emitNav = () => {
    reached = Math.max(reached, model.currentPageNo);
    hooks.onNav({
      titles: model.visiblePages.map((p) => p.title),
      current: model.currentPageNo,
      reached,
    });
  };
  model.onCurrentPageChanged.add(emitNav);
  emitNav();

  renderSurvey(model, container);
  return {
    retry: () => model.completeLastPage(),
    goTo: (index) => {
      if (index >= 0 && index <= reached) model.currentPageNo = index;
    },
    destroy: () => model.dispose(),
  };
}
