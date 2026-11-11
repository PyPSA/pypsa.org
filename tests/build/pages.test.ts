import { describe, expect, it } from "vitest";
import { parse, readBuilt } from "./helpers";

const visibleText = (root: ReturnType<typeof parse>) => {
  root.querySelectorAll("script, style, svg, template, noscript").forEach((n) => n.remove());
  return root.textContent.replace(/\s+/g, " ").trim();
};

describe.each(["contact.html", "privacy.html"])("%s", (file) => {
  it("carries at least 500 characters of visible text", () => {
    const article = parse(readBuilt(file)).querySelector("article")!;
    expect(visibleText(article).length).toBeGreaterThanOrEqual(500);
  });
});

describe("contact", () => {
  it("lists every channel", () => {
    const hrefs = parse(readBuilt("contact.html"))
      .querySelectorAll("article a")
      .map((a) => a.getAttribute("href"));
    for (const h of [
      "https://discord.gg/AnuJBk23FU",
      "https://github.com/PyPSA/PyPSA/discussions",
      "https://github.com/PyPSA/PyPSA/issues",
      "https://groups.google.com/g/pypsa",
      "https://mastodon.social/@pypsa",
      "https://bsky.app/profile/pypsa-org.bsky.social",
      "https://www.linkedin.com/company/pypsa",
    ])
      expect(hrefs).toContain(h);
  });
});

describe("privacy", () => {
  const html = readBuilt("privacy.html");

  it("never mentions pypsalabs.org", () => {
    expect(html).not.toContain("pypsalabs.org");
  });

  it("names PyPSA Labs only in the operator, controller and DDG blocks", () => {
    const root = parse(html);
    const article = root.querySelector("article")!;
    expect(visibleText(parse(article.outerHTML))).toContain("PyPSA Labs gGmbH");
    const rest = parse(article.outerHTML);
    rest.querySelectorAll("[data-lead], #controller, #legal-notice").forEach((n) => n.remove());
    expect(visibleText(rest)).not.toMatch(/PyPSA Labs/i);
  });

  it("keeps hosting and avatars in their own sections", () => {
    const root = parse(html);
    expect(root.querySelector("#hosting")?.text).toContain("GitHub Pages");
    expect(root.querySelector("#github-avatars")?.text).toContain("avatars");
  });
});

describe("404.html", () => {
  const root = parse(readBuilt("404.html"));
  const hrefs = root.querySelectorAll("article a").map((a) => a.getAttribute("href"));

  it("links home, docs, sitemap and llms.txt", () => {
    expect(hrefs).toEqual(
      expect.arrayContaining(["/", "https://docs.pypsa.org", "/sitemap.xml", "/llms.txt"])
    );
  });

  it("is noindex without a canonical", () => {
    expect(root.querySelector('meta[name="robots"]')?.getAttribute("content")).toContain("noindex");
    expect(root.querySelector('link[rel="canonical"]')).toBeNull();
  });
});

describe("footer on /", () => {
  it("links /contact and /privacy", () => {
    const hrefs = parse(readBuilt("index.html"))
      .querySelectorAll("footer a")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(expect.arrayContaining(["/contact", "/privacy"]));
  });
});

describe("404 page", () => {
  it("loads its assets from root-absolute paths so it works at any depth", () => {
    const html = readBuilt("404.html");
    expect(html).not.toContain("./_app");
    expect(html).toContain("/_app/");
  });
});
