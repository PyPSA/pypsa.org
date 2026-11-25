import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../../src/worker";
import { securityHeaders } from "../../src/worker-headers";
import { mdPathOf } from "../../src/lib/site/md-path";
import { buildPayload, createSurvey } from "../../src/lib/survey/model";
import { MAX_TEXT_LENGTH, waves } from "../../src/lib/survey/wave";

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
  const find = (name: string) => {
    const all: { name: string; rows?: { value: string }[]; choices?: { value: string }[] }[] = [];
    const walk = (els: typeof all) =>
      els.forEach(
        (e) => (all.push(e), walk((e as never as { elements?: typeof all }).elements ?? []))
      );
    def.survey.pages.forEach((p) => walk(p.elements as typeof all));
    return all.find((e) => e.name === name)!;
  };
  const q29Rows = find("q2_9").rows!.map((r) => r.value);
  const q31Rows = find("q3_1").rows!.map((r) => r.value);
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

  /** A full response as the headless questionnaire model builds it; `drive` edits it the way the UI does. */
  const valid = (
    drive?: (model: ReturnType<typeof createSurvey>) => void
  ): Record<string, unknown> => {
    const model = createSurvey(def, {
      storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      random: () => 0.5,
      now: () => OPEN,
    });
    model.data = {
      q1_1: "other",
      "q1_1-Comment": "Standards body",
      q1_2: "de",
      q1_3: "lt_1y",
      q2_1: ["dispatch", "other"],
      "q2_1-Comment": "Teaching",
      q2_3: ["scratch", { value: "workflow", comment: "PyPSA-Eur" }],
      q2_6_snapshots: 8760,
      q2_6_buses: 50,
      q2_6_components: 1000,
      q2_9: { [q29Rows[0]]: { used: ["yes"], top3: ["yes"] }, [q29Rows[1]]: { new: ["yes"] } },
      q3_1: { [q31Rows[0]]: "3", [q31Rows[1]]: "unclear" },
      q3_6_1: ["no"],
      q4_1: "Thanks",
      q4_4: "Acme",
    };
    drive?.(model);
    return JSON.parse(JSON.stringify(buildPayload(model)));
  };
  const withAnswers = (patch: Record<string, unknown>) => {
    const v = valid();
    return { ...v, answers: { ...(v.answers as object), ...patch } };
  };
  const withoutAnswer = (name: string) => {
    const v = valid();
    const answers = { ...(v.answers as Record<string, unknown>) };
    delete answers[name];
    return { ...v, answers };
  };

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

  it("accepts a showCommentArea choice ticked without a comment, as the UI writes it", async () => {
    const payload = valid((model) => {
      const q = model.getQuestionByName("q2_3") as any;
      model.clearValue("q2_3");
      q.renderedValue = ["scratch", "workflow"];
    });
    expect((payload.answers as Record<string, unknown>).q2_3).toEqual([
      { value: "scratch" },
      { value: "workflow" },
    ]);
    expect((await postJson(payload)).status).toBe(201);
  });

  it("rejects an empty `other` comment in the UI, and the Worker rejects it too", async () => {
    let invalid = false;
    const payload = valid((model) => {
      const q = model.getQuestionByName("q1_1") as any;
      model.clearValue("q1_1");
      q.renderedValue = "other";
      invalid = q.hasErrors();
    });
    expect(invalid).toBe(true);
    const res = await postJson(payload);
    expect(res.status).toBe(400);
  });

  it("stores a valid response and returns 201 with security headers", async () => {
    const payload = valid();
    const res = await postJson(payload);
    expect(res.status).toBe(201);
    expect(res.headers.get("Strict-Transport-Security")).toBeTruthy();
    expect(rows).toHaveLength(1);
    const [id, wave, version, receivedAt, seconds, sectionOrder, answers] = rows[0];
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect([wave, version]).toEqual([def.wave, def.version]);
    expect(seconds).toBe(payload.seconds);
    expect(receivedAt).toBe(OPEN.toISOString());
    expect(JSON.parse(sectionOrder as string)).toEqual(payload.section_order);
    expect(JSON.parse(answers as string)).toEqual(payload.answers);
    expect(limitKeys).toEqual(["1.2.3.4"]);
  });

  it("accepts a payload with every free-text field at the cap, multi-byte included", async () => {
    const text = "€".repeat(MAX_TEXT_LENGTH);
    const payload = withAnswers({
      "q1_1-Comment": text,
      "q2_1-Comment": text,
      q2_3: [
        { value: "workflow", comment: text },
        { value: "import", comment: text },
      ],
      q3_1_other: text,
      q3_2_other: text,
      q3_3_other: text,
      q3_4_other: text,
      q3_5_other: text,
      q3_6_other: text,
      q4_1: text,
      q4_2: text,
      q4_3: text,
      q4_4: text,
    });
    expect(new TextEncoder().encode(JSON.stringify(payload)).byteLength).toBeGreaterThan(64 * 1024);
    expect((await postJson(payload)).status).toBe(201);
  });

  const big = "x".repeat(5001);
  it.each([
    ["unknown wave", () => ({ ...valid(), wave: "1999-h1" }), 400, "unknown_wave"],
    ["wrong version", () => ({ ...valid(), version: 99 }), 400, "wrong_version"],
    ["null seconds", () => ({ ...valid(), seconds: null }), 400, "invalid_seconds"],
    ["seconds -1", () => ({ ...valid(), seconds: -1 }), 400, "invalid_seconds"],
    ["seconds 604801", () => ({ ...valid(), seconds: 604801 }), 400, "invalid_seconds"],
    ["fractional seconds", () => ({ ...valid(), seconds: 1.5 }), 400, "invalid_seconds"],
    [
      "section_order with a duplicate",
      () => ({
        ...valid(),
        section_order: ["grid", "grid", "data", "scale", "analysis", "operations"],
      }),
      400,
      "invalid_section_order",
    ],
    [
      "section_order with an unknown id",
      () => ({ ...valid(), section_order: [1] }),
      400,
      "invalid_section_order",
    ],
    ["answers not an object", () => ({ ...valid(), answers: [] }), 400, "invalid_answers"],
    ["body not an object", () => [], 400, "not_object"],
    ["unknown answer key", () => withAnswers({ nope: 1 }), 400, "unknown_answer_key"],
    ["unknown radio slug", () => withAnswers({ q1_1: "nonsense" }), 400, "invalid_choice"],
    ["unknown dropdown slug", () => withAnswers({ q1_2: "zz" }), 400, "invalid_choice"],
    ["unknown checkbox slug", () => withAnswers({ q2_1: ["nonsense"] }), 400, "invalid_choice"],
    ["other without showOtherItem", () => withAnswers({ q2_3: ["other"] }), 400, "invalid_choice"],
    ["other without its comment", () => withoutAnswer("q1_1-Comment"), 400, "invalid_choice"],
    [
      "comment object on a plain choice",
      () => withAnswers({ q2_3: [{ value: "scratch", comment: "x" }] }),
      400,
      "invalid_choice",
    ],
    ["bad matrix row", () => withAnswers({ q3_1: { nope: "3" } }), 400, "invalid_matrix_cell"],
    [
      "bad matrix column",
      () => withAnswers({ q3_1: { [q31Rows[0]]: "9" } }),
      400,
      "invalid_matrix_cell",
    ],
    [
      "bad q2_9 column",
      () => withAnswers({ q2_9: { [q29Rows[0]]: { other: ["yes"] } } }),
      400,
      "invalid_matrix_cell",
    ],
    [
      "bad q2_9 value",
      () => withAnswers({ q2_9: { [q29Rows[0]]: { used: ["no"] } } }),
      400,
      "invalid_matrix_cell",
    ],
    ["negative number", () => withAnswers({ q2_6_buses: -1 }), 400, "invalid_number"],
    ["non-finite number", () => withAnswers({ q2_6_buses: "Infinity" }), 400, "invalid_number"],
    ["number over the slider max", () => withAnswers({ q2_6_buses: 10001 }), 400, "invalid_number"],
    ["5001-char text", () => withAnswers({ q4_4: big }), 400, "text_too_long"],
    ["5001-char comment", () => withAnswers({ "q1_1-Comment": big }), 400, "text_too_long"],
    ["missing q1_1", () => withoutAnswer("q1_1"), 400, "missing_required"],
    ["missing q1_2", () => withoutAnswer("q1_2"), 400, "missing_required"],
    [
      "four Top 3 rows",
      () =>
        withAnswers({
          q2_9: Object.fromEntries(q29Rows.slice(0, 4).map((r) => [r, { top3: ["yes"] }])),
        }),
      400,
      "too_many_top3",
    ],
  ])("rejects %s and stores nothing", async (_name, payload, status, code) => {
    const res = await postJson(payload());
    expect(res.status).toBe(status);
    expect(await res.json()).toEqual({ error: code });
    expect(res.headers.get("Strict-Transport-Security")).toBeTruthy();
    expect(rows).toHaveLength(0);
  });

  it("returns 201 for a filled honeypot without inserting", async () => {
    const res = await postJson({ ...valid(), hp_field: "http://spam" });
    expect(res.status).toBe(201);
    expect(rows).toHaveLength(0);
  });

  it("routes a trailing slash to the handler", async () => {
    const res = await worker.fetch(
      new Request("https://pypsa.org/api/survey/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valid()),
      }),
      surveyEnv()
    );
    expect(res.status).toBe(201);
    expect(rows).toHaveLength(1);
  });

  it("rejects a closed wave", async () => {
    vi.setSystemTime(new Date("2027-01-01T00:00:00Z"));
    const res = await postJson(valid());
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "wave_closed" });
    expect(rows).toHaveLength(0);
  });

  it("stores outside the open window on a preview deploy", async () => {
    vi.setSystemTime(new Date("2026-11-20T00:00:00Z"));
    const res = await worker.fetch(
      new Request("https://preview.workers.dev/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json", "CF-Connecting-IP": "1.2.3.4" },
        body: JSON.stringify(valid()),
      }),
      { ...surveyEnv(), SURVEY_TEST: "1" }
    );
    expect(res.status).toBe(201);
    expect(rows).toHaveLength(1);
  });

  it("rejects malformed JSON", async () => {
    const res = await post("{not json");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "malformed_json" });
    expect(rows).toHaveLength(0);
  });

  it.each(["text/plain", "application/jsonx", "application/json-patch+json"])(
    "rejects content type %s",
    async (type) => {
      const res = await post(JSON.stringify(valid()), { "Content-Type": type });
      expect(res.status).toBe(415);
      expect(await res.json()).toEqual({ error: "unsupported_media_type" });
      expect(rows).toHaveLength(0);
    }
  );

  it("accepts a charset parameter", async () => {
    const res = await post(JSON.stringify(valid()), {
      "Content-Type": "application/json; charset=utf-8",
    });
    expect(res.status).toBe(201);
  });

  it("rejects an oversized body with a Content-Length header", async () => {
    const big = JSON.stringify({ ...withAnswers({ q4_4: "x".repeat(300_000) }) });
    const res = await post(big, { "Content-Length": String(big.length) });
    expect(res.status).toBe(413);
    expect(rows).toHaveLength(0);
  });

  it("rejects an oversized streamed body without Content-Length", async () => {
    const chunk = new TextEncoder().encode("x".repeat(10_000));
    const stream = new ReadableStream({
      start(c) {
        for (let i = 0; i < 30; i++) c.enqueue(chunk);
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
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(await res.json()).toEqual({ error: "rate_limited" });
    expect(rows).toHaveLength(0);
  });

  it.each(["GET", "PUT", "DELETE"])("answers %s with 405", async (method) => {
    const res = await post(null, {}, method);
    expect(res.status).toBe(405);
    expect(await res.json()).toEqual({ error: "method_not_allowed" });
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
    expect(await res.json()).toEqual({ error: "storage_failed" });
  });
});
