import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../../src/worker";

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const BREVO = "https://api.brevo.com/v3/contacts/doubleOptinConfirmation";

const config = {
  BREVO_API_KEY: "brevo-key",
  TURNSTILE_SECRET_KEY: "ts-secret",
  BREVO_LIST_ID: "7",
  BREVO_DOI_TEMPLATE_ID: "12",
  BREVO_DOI_REDIRECT_URL: "https://pypsa.org/newsletter/confirmed",
};

const assets = {
  fetch: async () => new Response("<html>asset</html>"),
};

const post = (
  body: unknown,
  overrides: Partial<Record<keyof typeof config, string | undefined>> = {}
) =>
  worker.fetch(
    new Request("https://pypsa.org/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.9" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    { ASSETS: assets, ...config, ...overrides }
  );

const valid = { email: "ada@example.org", "cf-turnstile-response": "token-123" };

/** Stubs fetch so siteverify answers `turnstile` and Brevo answers `brevo`. Returns the mock. */
function stub(
  turnstile: Response | Error,
  brevo: Response | Error = new Response(null, { status: 201 })
) {
  const mock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const reply = String(input) === SITEVERIFY ? turnstile : brevo;
    if (reply instanceof Error) throw reply;
    return reply.clone();
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

const passed = () => Response.json({ success: true });

afterEach(() => vi.unstubAllGlobals());

describe("POST /api/newsletter", () => {
  it("signs up a valid email", async () => {
    stub(passed());
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(res.headers.get("Content-Security-Policy")).toContain("challenges.cloudflare.com");
  });

  it("rejects an invalid email or invalid JSON with 400", async () => {
    stub(passed());
    expect((await post({ ...valid, email: "not-an-email" })).status).toBe(400);
    expect((await post({ ...valid, email: `${"a".repeat(250)}@x.org` })).status).toBe(400);
    expect((await post("{nope")).status).toBe(400);
  });

  it("rejects a failed Turnstile check or empty token with 400", async () => {
    stub(Response.json({ success: false }));
    expect((await post(valid)).status).toBe(400);
    const mock = stub(passed());
    expect((await post({ ...valid, "cf-turnstile-response": "" })).status).toBe(400);
    expect(mock).not.toHaveBeenCalled();
  });

  it("answers 502 when siteverify is unreachable", async () => {
    stub(new Error("offline"));
    expect((await post(valid)).status).toBe(502);
  });

  it.each(Object.keys(config))("answers 500 when %s is missing", async (name) => {
    stub(passed());
    const res = await post(valid, { [name]: undefined });
    expect(res.status).toBe(500);
  });

  it("answers 500 for a list or template ID that is not a positive integer", async () => {
    stub(passed());
    expect((await post(valid, { BREVO_LIST_ID: "0" })).status).toBe(500);
    expect((await post(valid, { BREVO_DOI_TEMPLATE_ID: "abc" })).status).toBe(500);
  });

  it("answers 502 when Brevo fails", async () => {
    stub(passed(), new Response("boom", { status: 500 }));
    expect((await post(valid)).status).toBe(502);
    stub(passed(), new Error("offline"));
    expect((await post(valid)).status).toBe(502);
  });

  it("counts an existing contact as success", async () => {
    stub(
      passed(),
      Response.json(
        { code: "duplicate_parameter", message: "Contact already exists" },
        { status: 400 }
      )
    );
    expect((await post(valid)).status).toBe(200);
    stub(passed(), new Response(null, { status: 425 }));
    expect((await post(valid)).status).toBe(200);
    stub(passed(), Response.json({ message: "invalid template" }, { status: 400 }));
    expect((await post(valid)).status).toBe(502);
  });

  it("sends the configured list, template and redirect to Brevo", async () => {
    const mock = stub(passed());
    await post(valid);
    const call = mock.mock.calls.find(([url]) => String(url) === BREVO);
    const init = call?.[1] ?? {};
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["api-key"]).toBe("brevo-key");
    expect(JSON.parse(init.body as string)).toEqual({
      email: "ada@example.org",
      includeListIds: [7],
      templateId: 12,
      redirectionUrl: "https://pypsa.org/newsletter/confirmed",
    });
  });

  it("sends the secret, token and client IP to siteverify", async () => {
    const mock = stub(passed());
    await post(valid);
    const call = mock.mock.calls.find(([url]) => String(url) === SITEVERIFY);
    const params = new URLSearchParams(call?.[1]?.body as string);
    expect(params.get("secret")).toBe("ts-secret");
    expect(params.get("response")).toBe("token-123");
    expect(params.get("remoteip")).toBe("203.0.113.9");
  });

  it("answers other methods with 405 and Allow: POST", async () => {
    const res = await worker.fetch(new Request("https://pypsa.org/api/newsletter"), {
      ASSETS: assets,
      ...config,
    });
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("POST");
  });
});
