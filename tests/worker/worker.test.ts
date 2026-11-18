import { describe, expect, it } from "vitest";
import worker from "../../src/worker";
import { securityHeaders } from "../../src/worker-headers";
import { mdPathOf } from "../../src/lib/site/md-path";

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
    env
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
