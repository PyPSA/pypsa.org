import type { Model } from "survey-core";
import { buildPayload, clearProgress } from "./model";
import type { SubmitResult } from "./submit";

export type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "retry"; message: string }
  | { kind: "rejected"; message: string };

export interface SubmitHooks {
  onSubmitState: (state: SubmitState) => void;
  onCompleted: () => void;
}

/** Holds completion until the POST is accepted; survey-core completes via `options.allow`. */
export function attachSubmitGuard(
  model: Model,
  hooks: SubmitHooks,
  submit: (payload: ReturnType<typeof buildPayload>) => Promise<SubmitResult>
): void {
  let sending = false;
  model.onCompleting.add(async (_survey, options) => {
    if (sending) {
      options.allow = false;
      return;
    }
    sending = true;
    hooks.onSubmitState({ kind: "sending" });
    try {
      const result = await submit(buildPayload(model));
      options.allow = result.kind === "ok";
      if (result.kind !== "ok") {
        hooks.onSubmitState(result);
        return;
      }
      clearProgress(model);
      hooks.onSubmitState({ kind: "idle" });
    } finally {
      sending = false;
    }
  });
  model.onComplete.add(() => hooks.onCompleted());
}
