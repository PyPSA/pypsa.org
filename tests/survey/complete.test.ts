import { describe, expect, it, vi } from "vitest";
import { createSurvey, type SurveyStorage } from "../../src/lib/survey/model";
import { attachSubmitGuard } from "../../src/lib/survey/complete";
import { waves } from "../../src/lib/survey/wave";
import type { SubmitResult } from "../../src/lib/survey/submit";

const storage: SurveyStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

function setup(submit: () => Promise<SubmitResult>) {
  const model = createSurvey(waves["2026-h2"], {
    storage,
    random: () => 0.5,
    now: () => new Date("2026-12-01T10:00:00Z"),
  });
  (model as unknown as { currentPageNo: number }).currentPageNo = model.visiblePageCount - 1;
  const onCompleted = vi.fn();
  const states: { kind: string }[] = [];
  const submitFn = vi.fn(submit);
  attachSubmitGuard(model, { onSubmitState: (s) => states.push(s), onCompleted }, submitFn);
  const isCompleted = () => (model as unknown as { isCompleted: boolean }).isCompleted;
  return { model, onCompleted, states, submitFn, isCompleted };
}

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("attachSubmitGuard", () => {
  it("completes the model after a successful submit", async () => {
    const { model, onCompleted, submitFn, isCompleted } = setup(async () => ({ kind: "ok" }));
    model.tryComplete();
    await vi.waitFor(() => expect(onCompleted).toHaveBeenCalledTimes(1));
    expect(isCompleted()).toBe(true);
    expect(submitFn).toHaveBeenCalledTimes(1);
  });

  it("sends once for an in-flight duplicate", async () => {
    let release!: (r: SubmitResult) => void;
    const { model, submitFn, isCompleted } = setup(
      () => new Promise<SubmitResult>((r) => (release = r))
    );
    model.tryComplete();
    model.tryComplete();
    await tick();
    expect(submitFn).toHaveBeenCalledTimes(1);
    release({ kind: "ok" });
    await vi.waitFor(() => expect(isCompleted()).toBe(true));
    expect(submitFn).toHaveBeenCalledTimes(1);
  });

  it("stays incomplete after a retryable failure and completes on retry", async () => {
    const results: SubmitResult[] = [{ kind: "retry", message: "offline" }, { kind: "ok" }];
    const { model, states, submitFn, isCompleted, onCompleted } = setup(
      async () => results.shift()!
    );
    model.tryComplete();
    await vi.waitFor(() => expect(states.some((s) => s.kind === "retry")).toBe(true));
    expect(isCompleted()).toBe(false);
    expect(onCompleted).not.toHaveBeenCalled();
    model.completeLastPage();
    await vi.waitFor(() => expect(isCompleted()).toBe(true));
    expect(submitFn).toHaveBeenCalledTimes(2);
    expect(onCompleted).toHaveBeenCalledTimes(1);
  });

  it("stays incomplete after a rejected submit", async () => {
    const { model, states, isCompleted, onCompleted } = setup(async () => ({
      kind: "rejected",
      message: "invalid",
    }));
    model.tryComplete();
    await vi.waitFor(() => expect(states.some((s) => s.kind === "rejected")).toBe(true));
    await tick();
    expect(isCompleted()).toBe(false);
    expect(onCompleted).not.toHaveBeenCalled();
  });
});
