import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { routes } from "../../src/lib/site/routes";
import { BUILD_DIR, parse, readBuilt } from "./helpers";

const mdFile = (mdPath: string) => mdPath.slice(1);

describe.each(routes.map((r) => [r.path, r] as const))("markdown mirror of %s", (path, route) => {
  it("exists and is non-empty", () => {
    expect(existsSync(join(BUILD_DIR, mdFile(route.mdPath)))).toBe(true);
    expect(readBuilt(mdFile(route.mdPath)).trim().length).toBeGreaterThan(200);
  });

  it("opens with the title and canonical URL", () => {
    const md = readBuilt(mdFile(route.mdPath));
    const canonical = path === "/" ? "https://pypsa.org/" : `https://pypsa.org${path}`;
    expect(md.startsWith("# ")).toBe(true);
    expect(md.split("\n").slice(0, 8).join("\n")).toContain(canonical);
    expect(md).not.toMatch(/<a |<\/a>|&amp;/);
  });
});

describe("markdown mirror titles", () => {
  it("opens each mirror with the registry title", () => {
    for (const r of routes) {
      const md = readBuilt(mdFile(r.mdPath));
      expect(md.split("\n")[0]).toBe(`# ${r.title}`);
    }
  });
});

describe("404.md", () => {
  it("links docs, sitemap and llms.txt", () => {
    const md = readBuilt("404.md");
    expect(md).toContain("https://docs.pypsa.org");
    expect(md).toContain("https://pypsa.org/sitemap.xml");
    expect(md).toContain("https://pypsa.org/llms.txt");
  });

  it("has no Canonical URL line", () => {
    expect(readBuilt("404.md")).not.toMatch(/^Canonical URL:/m);
  });
});

describe("alternate links", () => {
  it("resolve to built files", () => {
    for (const r of routes) {
      const html = readBuilt(r.path === "/" ? "index.html" : `${r.path.slice(1)}.html`);
      const href = parse(html).querySelector('link[rel="alternate"][type="text/markdown"]')?.getAttribute("href");
      expect(href).toBe(`https://pypsa.org${r.mdPath}`);
      expect(existsSync(join(BUILD_DIR, mdFile(r.mdPath)))).toBe(true);
    }
  });
});
