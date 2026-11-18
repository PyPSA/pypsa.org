import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../../src/worker";
import { securityHeaders } from "../../src/worker-headers";
import { mdPathOf } from "../../src/lib/site/md-path";
import { allowedAnswerKeys, waves } from "../../src/lib/survey/wave";

const NOT_FOUND_HTML = "<html>not found</html>";

/** Static files keyed by path, as the `ASSETS` binding would serve them after `html_handling`. */
const files: Record<string, string> = {
  "/": "<html>home</html>",
  "/index.md": "# PyPSA",
  "/roadmap": "<html>roadmap</html>",
  "/roadmap.md": "# Roadmap",
  "/events/meetup": "<html>meetup</html>",
  "/events/meetup.md": "# Meetup",
  "/4th-user-meeting": "<html>alias</html>",
  "/embed/contributors": "<html>embed</html>",
  "/404.md": "# Not found\n\nSee https://pypsa.org/llms.txt",
  "/robots.txt": "User-agent: *",
};

/** Answers misses with the `404.html` body and status 404, as `not_found_handling: "404-page"` does. */
const env = {
  ASSETS: {
    async fetch(req: Request): Promise<Response> {
      const path = new URL(req.url).pathname.replace(/(.)\/$/, "$1");
      const body = files[path];
      return body === undefined
        ? new Response(NOT_FOUND_HTML, { status: 404, headers: { "Content-Type": "text/html" } })
        : new Response(body, { headers: { "Content-Type": "text/html" } });
    },
  },
};

const get = (path: string, accept?: string, method = "GET") =>
  worker.fetch(
    new Request(`https://pypsa.org${path}`, {
      method,
      headers: accept ? { Accept: accept } : {},
    }),
    env as unknown as Parameters<typeof worker.fetch>[1]
  );

const MD = "text/markdown";
const BROWSER = "text/html,application/xhtml+xml,*/*;q=0.8";

describe("mdPathOf", () => {
  it("maps / to the index mirror and strips trailing slashes", () => {
    expect(mdPathOf("/")).toBe("/index.md");
    expect(mdPathOf("/roadmap")).toBe("/roadmap.md");
    expect(mdPathOf("/roadmap/")).toBe("/roadmap.md");
    expect(mdPathOf("/events/x")).toBe("/events/x.md");
  });
});

describe("markdown negotiation", () => {
  it.each([
    ["/roadmap", "# Roadmap"],
    ["/roadmap/", "# Roadmap"],
    ["/", "# PyPSA"],
    ["/events/meetup", "# Meetup"],
  ])("serves the mirror of %s", async (path, body) => {
    const res = await get(path, MD);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(res.headers.get("Vary")).toBe("Accept");
    expect(await res.text()).toBe(body);
  });

  it("serves HTML for text/html", async () => {
    const res = await get("/roadmap", "text/html");
    expect(res.status).toBe(200);
    expect(res.headers.get("Vary")).toBe("Accept");
    expect(await res.text()).toBe("<html>roadmap</html>");
  });

  it("serves HTML for a browser Accept header", async () => {
    const res = await get("/roadmap", BROWSER);
    expect(await res.text()).toBe("<html>roadmap</html>");
  });

  it("serves HTML when no Accept header is sent", async () => {
    expect(await (await get("/roadmap")).text()).toBe("<html>roadmap</html>");
  });

  it("prefers markdown only when its q is at least that of text/html", async () => {
    expect(await (await get("/roadmap", "text/markdown, text/html;q=0.9")).text()).toBe(
      "# Roadmap"
    );
    expect(await (await get("/roadmap", "text/markdown;q=0.5, text/html")).text()).toBe(
      "<html>roadmap</html>"
    );
    expect(await (await get("/roadmap", "text/markdown;q=0, */*")).text()).toBe(
      "<html>roadmap</html>"
    );
  });

  it("returns the markdown 404 for a missing route", async () => {
    const res = await get("/nope", MD);
    expect(res.status).toBe(404);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(res.headers.get("Vary")).toBe("Accept");
    expect(await res.text()).toContain("llms.txt");
  });

  it("returns the HTML 404 page for a missing route", async () => {
    const res = await get("/nope", "text/html");
    expect(res.status).toBe(404);
    expect(res.headers.get("Vary")).toBe("Accept");
    expect(await res.text()).toBe(NOT_FOUND_HTML);
  });

  it("falls back to HTML for an alias without a mirror", async () => {
    const res = await get("/4th-user-meeting", MD);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("<html>alias</html>");
  });

  it("passes through paths with a file extension", async () => {
    const res = await get("/robots.txt", MD);
    expect(await res.text()).toBe("User-agent: *");
  });

  it("passes through methods other than GET and HEAD", async () => {
    const res = await get("/roadmap", MD, "POST");
    expect(await res.text()).toBe("<html>roadmap</html>");
  });
});

describe("security headers", () => {
  const cases: [string, string | undefined][] = [
    ["/", MD],
    ["/", BROWSER],
    ["/roadmap", MD],
    ["/nope", MD],
    ["/nope", BROWSER],
    ["/4th-user-meeting", MD],
    ["/embed/contributors", BROWSER],
    ["/robots.txt", undefined],
  ];

  it.each(cases)("are set on %s (Accept %s)", async (path, accept) => {
    const res = await get(path, accept);
    for (const [name, value] of Object.entries(securityHeaders(path))) {
      expect(res.headers.get(name)).toBe(value);
    }
    for (const name of [
      "Content-Security-Policy",
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Strict-Transport-Security",
    ]) {
      expect(res.headers.get(name)).toBeTruthy();
    }
  });

  it("forbid framing outside /embed", async () => {
    const res = await get("/roadmap", BROWSER);
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(res.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'self'");
  });

  it("allow framing of /embed pages", async () => {
    const res = await get("/embed/contributors", BROWSER);
    expect(res.headers.get("X-Frame-Options")).toBeNull();
    expect(res.headers.get("Content-Security-Policy")).toContain("frame-ancestors *");
  });
});

describe("POST /api/survey", () => {
  const def = waves["2026-h2"];
  const [key] = [...allowedAnswerKeys(def)];
  const OPEN = new Date("2026-12-01T12:00:00+01:00");

  let rows: unknown[][];
  let limited: boolean;
  let limitKeys: string[];
  const surveyEnv = () => ({
    ...env,
    SURVEY_DB: {
      prepare(sql: string) {
        expect(sql).toMatch(/INSERT INTO responses/);
        return {
          bind(...values: unknown[]) {
            return {
              async run() {
                rows.push(values);
                return { success: true };
              },
            };
          },
        };
      },
    },
    SURVEY_RATE_LIMIT: {
      async limit({ key }: { key: string }) {
        limitKeys.push(key);
        return { success: !limited };
      },
    },
  });

  beforeEach(() => {
    rows = [];
    limited = false;
    limitKeys = [];
    vi.useFakeTimers();
    vi.setSystemTime(OPEN);
  });
  afterEach(() => vi.useRealTimers());

  const valid = () => ({
    wave: def.wave,
    version: def.version,
    seconds: 120,
    section_order: ["a", "b"],
    answers: { [key]: "x" },
    website: "",
  });

  const post = (body: BodyInit | null, headers: Record<string, string> = {}, method = "POST") =>
    worker.fetch(
      new Request("https://pypsa.org/api/survey", {
        method,
        headers: { "Content-Type": "application/json", "CF-Connecting-IP": "1.2.3.4", ...headers },
        body,
      }),
      surveyEnv()
    );
  const postJson = (payload: unknown) => post(JSON.stringify(payload));

  it("stores a valid response and returns 201 with security headers", async () => {
    const res = await postJson(valid());
    expect(res.status).toBe(201);
    expect(res.headers.get("Strict-Transport-Security")).toBeTruthy();
    expect(rows).toHaveLength(1);
    const [id, wave, version, receivedAt, seconds, sectionOrder, answers] = rows[0];
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect([wave, version, seconds]).toEqual([def.wave, def.version, 120]);
    expect(receivedAt).toBe(OPEN.toISOString());
    expect(JSON.parse(sectionOrder as string)).toEqual(["a", "b"]);
    expect(JSON.parse(answers as string)).toEqual({ [key]: "x" });
    expect(limitKeys).toEqual(["1.2.3.4"]);
  });

  it("accepts null seconds", async () => {
    const res = await postJson({ ...valid(), seconds: null });
    expect(res.status).toBe(201);
    expect(rows[0][4]).toBeNull();
  });

  it.each([
    ["unknown answer key", () => ({ ...valid(), answers: { nope: 1 } }), 400],
    ["filled honeypot", () => ({ ...valid(), website: "http://spam" }), 400],
    ["unknown wave", () => ({ ...valid(), wave: "1999-h1" }), 400],
    ["wrong version", () => ({ ...valid(), version: 99 }), 400],
    ["negative seconds", () => ({ ...valid(), seconds: -1 }), 400],
    ["fractional seconds", () => ({ ...valid(), seconds: 1.5 }), 400],
    ["bad section_order", () => ({ ...valid(), section_order: [1] }), 400],
    ["answers not an object", () => ({ ...valid(), answers: [] }), 400],
    ["body not an object", () => [], 400],
  ])("rejects %s and stores nothing", async (_name, payload, status) => {
    const res = await postJson(payload());
    expect(res.status).toBe(status);
    expect(res.headers.get("Strict-Transport-Security")).toBeTruthy();
    expect(rows).toHaveLength(0);
  });

  it("rejects a closed wave", async () => {
    vi.setSystemTime(new Date("2027-01-01T00:00:00Z"));
    const res = await postJson(valid());
    expect(res.status).toBe(403);
    expect(rows).toHaveLength(0);
  });

  it("rejects malformed JSON", async () => {
    const res = await post("{not json");
    expect(res.status).toBe(400);
    expect(rows).toHaveLength(0);
  });

  it("rejects a non-JSON content type", async () => {
    const res = await post(JSON.stringify(valid()), { "Content-Type": "text/plain" });
    expect(res.status).toBe(415);
    expect(rows).toHaveLength(0);
  });

  it("rejects an oversized body with a Content-Length header", async () => {
    const big = JSON.stringify({ ...valid(), answers: { [key]: "x".repeat(70_000) } });
    const res = await post(big, { "Content-Length": String(big.length) });
    expect(res.status).toBe(413);
    expect(rows).toHaveLength(0);
  });

  it("rejects an oversized streamed body without Content-Length", async () => {
    const chunk = new TextEncoder().encode("x".repeat(10_000));
    const stream = new ReadableStream({
      start(c) {
        for (let i = 0; i < 8; i++) c.enqueue(chunk);
        c.close();
      },
    });
    const req = new Request("https://pypsa.org/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stream,
      // @ts-expect-error required by undici for stream bodies
      duplex: "half",
    });
    const res = await worker.fetch(req, surveyEnv());
    expect(res.status).toBe(413);
    expect(rows).toHaveLength(0);
  });

  it("returns 429 over the rate limit and stores nothing", async () => {
    limited = true;
    const res = await postJson(valid());
    expect(res.status).toBe(429);
    expect(rows).toHaveLength(0);
  });

  it.each(["GET", "PUT", "DELETE"])("answers %s with 405", async (method) => {
    const res = await post(null, {}, method);
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("POST");
    expect(res.headers.get("Strict-Transport-Security")).toBeTruthy();
    expect(rows).toHaveLength(0);
  });

  it("returns 500 when the insert fails", async () => {
    const e = surveyEnv();
    e.SURVEY_DB.prepare = () => ({
      bind: () => ({
        run: async () => {
          throw new Error("boom");
        },
      }),
    });
    const res = await worker.fetch(
      new Request("https://pypsa.org/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valid()),
      }),
      e
    );
    expect(res.status).toBe(500);
  });
});
