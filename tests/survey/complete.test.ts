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
  model.setValue("q1_1", "ngo");
  model.setValue("q1_2", "de");
  (model as unknown as { currentPageNo: number }).currentPageNo = model.visiblePageCount - 1;
  const onCompleted = vi.fn();
  const states: { kind: string }[] = [];
  const submitFn = vi.fn(submit);
  const onInvalid = vi.fn();
  attachSubmitGuard(
    model,
    { onSubmitState: (s) => states.push(s), onCompleted, onInvalid },
    submitFn
  );
  const isCompleted = () => (model as unknown as { isCompleted: boolean }).isCompleted;
  return { model, onInvalid, onCompleted, states, submitFn, isCompleted };
}

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("attachSubmitGuard", () => {
  it("lands on page 0 and sends nothing after a back-jump cleared q1_1", async () => {
    const { model, onInvalid, submitFn } = setup(async () => ({ kind: "ok" }));
    model.setValue("q1_1", "ngo");
    model.setValue("q1_2", "de");
    (model as unknown as { currentPageNo: number }).currentPageNo = model.visiblePageCount - 1;
    model.setValue("q1_1", undefined);
    model.tryComplete();
    await tick();
    expect(model.currentPageNo).toBe(0);
    expect(onInvalid).toHaveBeenCalledWith(0);
    expect(submitFn).not.toHaveBeenCalled();
  });

  it("lands on the q2_9 page for four Top 3 rows and sends nothing", async () => {
    const { model, onInvalid, submitFn } = setup(async () => ({ kind: "ok" }));
    model.setValue("q1_1", "ngo");
    model.setValue("q1_2", "de");
    model.setValue("q1_3", "lt_1y");
    const rows = waves["2026-h2"].survey.pages
      .find((p) => p.name === "part2")!
      .elements.find((e) => e.name === "q2_9")!
      .rows!.slice(0, 4);
    model.setValue("q2_9", Object.fromEntries(rows.map((r) => [r.value, { top3: ["yes"] }])));
    model.tryComplete();
    await tick();
    const page = model.getPageByName("part2");
    expect(model.currentPage).toBe(page);
    expect(onInvalid).toHaveBeenCalledWith(model.visiblePages.indexOf(page));
    expect(submitFn).not.toHaveBeenCalled();
  });

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
    const { model, states, submitFn, isCompleted, onCompleted } = setup(async () =>
      results.shift()!
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
