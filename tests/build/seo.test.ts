import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { eventsData } from "../../src/lib/data/events";
import { aliases, routes } from "../../src/lib/site/routes";
import { BUILD_DIR, parse, readBuilt } from "./helpers";

const ORIGIN = "https://pypsa.org";
const htmlFile = (path: string) => (path === "/" ? "index.html" : `${path.slice(1)}.html`);
const canonicalOf = (path: string) => (path === "/" ? `${ORIGIN}/` : ORIGIN + path);

describe("route registry", () => {
  it("covers the top-level pages and every event", () => {
    const paths = routes.map((r) => r.path);
    for (const p of ["/", "/roadmap", "/events", "/contact", "/privacy"]) expect(paths).toContain(p);
    for (const e of eventsData) expect(paths).toContain(`/events/${e.slug}`);
    expect(paths.some((p) => p.startsWith("/embed") || p === "/404")).toBe(false);
  });

  it("maps the 4th-user-meeting alias to its event", () => {
    expect(aliases["/4th-user-meeting"]).toBe("/events/4th-user-meeting");
  });

  it("has a built page for every registry route", () => {
    for (const r of routes) expect(existsSync(join(BUILD_DIR, htmlFile(r.path))), r.path).toBe(true);
  });
});

describe.each(routes.map((r) => [r.path, r] as const))("seo head of %s", (path, route) => {
  const root = parse(readBuilt(htmlFile(path)));
  const metaContent = (sel: string) => root.querySelector(sel)?.getAttribute("content");

  it("has one canonical on the production origin", () => {
    const links = root.querySelectorAll('link[rel="canonical"]');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe(canonicalOf(path));
  });

  it("has title and description", () => {
    expect(root.querySelector("title")?.text).toBe(route.title);
    expect(metaContent('meta[name="description"]')).toBe(route.description);
  });

  it("has og tags", () => {
    expect(metaContent('meta[property="og:type"]')).toBe(route.ogType);
    expect(metaContent('meta[property="og:title"]')).toBe(route.title);
    expect(metaContent('meta[property="og:description"]')).toBe(route.description);
    expect(metaContent('meta[property="og:url"]')).toBe(canonicalOf(path));
    expect(metaContent('meta[property="og:image"]')).toMatch(/^https:\/\/pypsa\.org\//);
  });

  it("has twitter tags with name=, not property=", () => {
    for (const k of ["card", "title", "description", "image"])
      expect(metaContent(`meta[name="twitter:${k}"]`)).toBeTruthy();
    expect(root.querySelectorAll('meta[property^="twitter:"]')).toHaveLength(0);
  });

  it("flags the agentic site type and the markdown mirror", () => {
    expect(metaContent('meta[name="is-agentic-site-type"]')).toBe("docs");
    const alt = root.querySelector('link[rel="alternate"][type="text/markdown"]');
    expect(alt?.getAttribute("href")).toBe(ORIGIN + route.mdPath);
  });

  it("has one JSON-LD graph with SoftwareApplication and Organization", () => {
    const scripts = root.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    const graph = JSON.parse(scripts[0].text)["@graph"] as Record<string, unknown>[];
    const app = graph.find((n) => n["@type"] === "SoftwareApplication")!;
    expect(app.name).toBeTruthy();
    expect(app.description).toBeTruthy();
    expect(app.url).toBeTruthy();
    expect(app.sameAs).toEqual(expect.arrayContaining(["https://docs.pypsa.org"]));
    expect(graph.find((n) => n["@type"] === "Organization")?.name).toBe("PyPSA community");
  });

  it("is indexable", () => {
    expect(root.querySelector('meta[name="robots"]')).toBeNull();
  });
});

describe("alias and embed pages", () => {
  it("4th-user-meeting canonicalises to the event and is noindex", () => {
    const root = parse(readBuilt("4th-user-meeting.html"));
    const links = root.querySelectorAll('link[rel="canonical"]');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe(`${ORIGIN}/events/4th-user-meeting`);
    expect(root.querySelector('meta[name="robots"]')?.getAttribute("content")).toContain("noindex");
  });

  it("embed/contributors is noindex", () => {
    const root = parse(readBuilt("embed/contributors.html"));
    expect(root.querySelector('meta[name="robots"]')?.getAttribute("content")).toContain("noindex");
  });
});
