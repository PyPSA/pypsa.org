// Imported dynamically so SurveyJS and its CSS load only on /survey.
import "survey-core/survey-core.css";
import "survey-core/themes/adapters/shadcn-default.css";
import "./theme.css";
import { renderSurvey } from "survey-js-ui";
import type { Model } from "survey-core";
import { attachSubmitGuard, type SubmitState } from "./complete";
import { createSurvey, startSurvey } from "./model";
import { registerLogSlider } from "./log-slider";
import { submitResponse } from "./submit";
import type { WaveDefinition } from "./wave";

export type { SubmitState };

export interface MountHooks {
  onSubmitState: (state: SubmitState) => void;
  onCompleted: () => void;
  onSaveError: () => void;
}

export interface MountedSurvey {
  /** Runs the submit again after a retryable error. */
  retry: () => void;
  destroy: () => void;
}

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

  renderSurvey(model, container);
  return {
    retry: () => model.completeLastPage(),
    destroy: () => model.dispose(),
  };
}
