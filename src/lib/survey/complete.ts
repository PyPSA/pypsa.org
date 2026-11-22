import type { Model } from "survey-core";
import { buildPayload, clearProgress, firstInvalidPage, validatePage } from "./model";
import type { SubmitResult } from "./submit";

export type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "retry"; message: string }
  | { kind: "rateLimited"; message: string; retryAfter: number }
  | { kind: "rejected"; message: string };

export interface SubmitHooks {
  onSubmitState: (state: SubmitState) => void;
  onCompleted: () => void;
  /** Called after a failed submit check has moved to the first invalid page and shown its errors. */
  onInvalid: (pageIndex: number) => void;
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
    const invalid = firstInvalidPage(model);
    if (invalid !== -1) {
      options.allow = false;
      model.currentPageNo = invalid;
      validatePage(model, invalid);
      hooks.onInvalid(invalid);
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
