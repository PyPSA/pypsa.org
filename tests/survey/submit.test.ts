import { describe, expect, it } from "vitest";
import type { ErrorCode } from "../../src/lib/survey/wave";
import { errorCopy, submitResponse } from "../../src/lib/survey/submit";

const CODES: ErrorCode[] = [
  "unsupported_media_type",
  "method_not_allowed",
  "rate_limited",
  "payload_too_large",
  "malformed_json",
  "not_object",
  "unknown_wave",
  "wave_closed",
  "wrong_version",
  "invalid_seconds",
  "invalid_section_order",
  "invalid_answers",
  "unknown_answer_key",
  "invalid_choice",
  "invalid_matrix_cell",
  "invalid_number",
  "text_too_long",
  "missing_required",
  "too_many_top3",
  "too_many_picks",
  "storage_failed",
];
const payload = { wave: "w" };
const respond =
  (status: number, body: unknown = {}) =>
  async () =>
    new Response(JSON.stringify(body), { status });

describe("submitResponse", () => {
  it("posts JSON to /api/survey and reports 201 as ok", async () => {
    let seen: { url: string; init: RequestInit } | undefined;
    const result = await submitResponse(payload, async (url, init) => {
      seen = { url: String(url), init: init! };
      return new Response("{}", { status: 201 });
    });
    expect(result).toEqual({ kind: "ok" });
    expect(seen?.url).toBe("/api/survey");
    expect(seen?.init.method).toBe("POST");
    expect(new Headers(seen?.init.headers).get("content-type")).toBe("application/json");
    expect(seen?.init.body).toBe(JSON.stringify(payload));
  });

  it("treats a network error as retryable", async () => {
    const result = await submitResponse(payload, async () => {
      throw new TypeError("offline");
    });
    expect(result.kind).toBe("retry");
  });

  it("treats 5xx as retryable", async () => {
    expect((await submitResponse(payload, respond(500, { error: "storage failed" }))).kind).toBe(
      "retry"
    );
    expect((await submitResponse(payload, respond(503, "<html>"))).kind).toBe("retry");
  });

  it("maps each error code to copy that differs from the code", () => {
    for (const code of CODES) {
      const copy = errorCopy(code);
      expect(copy).not.toBe(code);
      expect(copy).not.toContain("_");
    }
  });

  it("gives generic copy with the contact address for an unknown code", () => {
    expect(errorCopy("nope")).toBe(
      "The survey could not be submitted. Please contact contact@pypsa.org."
    );
  });

  it("maps a 4xx Worker code to friendly copy", async () => {
    const r = await submitResponse(payload, respond(403, { error: "wave_closed" }));
    expect(r).toEqual({ kind: "rejected", message: errorCopy("wave_closed") });
  });

  it("returns rateLimited with retryAfter from the header", async () => {
    const res = async () =>
      new Response('{"error":"rate_limited"}', { status: 429, headers: { "Retry-After": "30" } });
    expect(await submitResponse(payload, res)).toEqual({
      kind: "rateLimited",
      message: "Too many submissions from your network, try again in a minute.",
      retryAfter: 30,
    });
  });

  it("defaults retryAfter to 60 and clamps it to 1..600", async () => {
    const at = async (h?: string) =>
      (await submitResponse(
        payload,
        async () => new Response("{}", { status: 429, headers: h ? { "Retry-After": h } : {} })
      )) as { retryAfter: number };
    expect((await at()).retryAfter).toBe(60);
    expect((await at("abc")).retryAfter).toBe(60);
    expect((await at("0")).retryAfter).toBe(1);
    expect((await at("9999")).retryAfter).toBe(600);
  });

  it("falls back to generic copy when a 4xx body is not JSON", async () => {
    const r = await submitResponse(payload, respond(400, "nope"));
    expect(r).toEqual({ kind: "rejected", message: errorCopy("nope") });
  });
});
