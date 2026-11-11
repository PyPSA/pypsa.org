import { describe, expect, it } from "vitest";
import { aliases, routes } from "../../src/lib/site/routes";
import { builtHtmlFiles, parse, readBuilt } from "./helpers";

const sitemap = () => parse(readBuilt("sitemap.xml"));

describe("sitemap.xml", () => {
  it("lists exactly the registry paths", () => {
    const locs = sitemap()
      .querySelectorAll("url > loc")
      .map((n) => n.text.trim());
    const expected = routes.map((r) => (r.path === "/" ? "https://pypsa.org/" : `https://pypsa.org${r.path}`));
    expect([...locs].sort()).toEqual([...expected].sort());
    for (const loc of locs) {
      expect(loc).not.toMatch(/\/embed|\/404/);
      for (const alias of Object.keys(aliases)) expect(loc).not.toBe(`https://pypsa.org${alias}`);
    }
  });

  it("gives every entry a YYYY-MM-DD lastmod", () => {
    const urls = sitemap().querySelectorAll("url");
    expect(urls).toHaveLength(routes.length);
    for (const u of urls) {
      expect(u.querySelector("lastmod")?.text.trim()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("llms.txt", () => {
  const txt = () => readBuilt("llms.txt");

  it("has the llmstxt.org structure", () => {
    const lines = txt().split("\n");
    expect(lines[0]).toMatch(/^# \S/);
    expect(txt()).toMatch(/\n> \S/);
    expect(txt()).toContain("\n## Pages\n");
    expect(txt()).toContain("\n## Docs\n");
    expect(txt()).toContain("https://docs.pypsa.org");
  });

  it("links every mirror", () => {
    for (const r of routes) {
      expect(txt()).toContain(`- [${r.title}](https://pypsa.org${r.mdPath}): ${r.description}`);
    }
  });
});

describe("llms-full.txt", () => {
  it("contains the body of every mirror, in registry order", () => {
    const full = readBuilt("llms-full.txt");
    let from = 0;
    for (const r of routes) {
      const body = readBuilt(r.mdPath.slice(1)).trim();
      const at = full.indexOf(body, from);
      expect(at, r.mdPath).toBeGreaterThanOrEqual(from);
      from = at + body.length;
    }
  });
});

describe("built pages", () => {
  it("maps every non-alias, non-embed, non-404 .html to a registry path", () => {
    const registry = new Set(routes.map((r) => r.path));
    const unknown = builtHtmlFiles()
      .filter((f) => f !== "404.html" && !f.startsWith("embed/"))
      .map((f) => "/" + f.replace(/(^|\/)index\.html$/, "").replace(/\.html$/, ""))
      .filter((p) => !(p in aliases) && !registry.has(p));
    expect(unknown).toEqual([]);
  });
});
