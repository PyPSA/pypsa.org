import { describe, expect, it } from "vitest";
import { submitResponse } from "../../src/lib/survey/submit";

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

  it("shows the Worker error text for 429 and other 4xx", async () => {
    expect(await submitResponse(payload, respond(429, { error: "too many requests" }))).toEqual({
      kind: "rejected",
      message: "too many requests",
    });
    const closed = await submitResponse(payload, respond(403, { error: "wave closed" }));
    expect(closed).toMatchObject({ kind: "rejected", message: "wave closed" });
  });

  it("falls back to a generic message when a 4xx body is not JSON", async () => {
    const r = await submitResponse(payload, respond(400, "nope"));
    expect(r.kind).toBe("rejected");
    expect((r as { message: string }).message).toMatch(/400/);
  });
});
