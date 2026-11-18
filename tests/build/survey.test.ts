import { dirname, posix } from "node:path";
import { describe, expect, it } from "vitest";
import { appJsFiles, builtHtmlFiles, parse, readBuilt } from "./helpers";

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

describe("/survey", () => {
  const html = () => readBuilt("survey.html");

  it("is prerendered with the welcome copy", () => {
    const root = parse(html());
    expect(norm(root.querySelector("h1")?.text ?? "")).toBe("PyPSA User Survey 2026");
    const text = norm(root.querySelector("main")?.text ?? "");
    expect(text).toContain("Help shape the next year of PyPSA");
    expect(text).toContain("10 to 15 minutes");
  });

  it("has a Markdown mirror with the welcome copy and the privacy link", () => {
    const md = readBuilt("survey.md");
    expect(md).toMatch(/^# PyPSA User Survey 2026/);
    expect(md).toContain("Help shape the next year of PyPSA");
    expect(md).toContain("https://pypsa.org/privacy#user-survey");
  });
});

describe("/privacy", () => {
  it("has the User survey section with its anchor", () => {
    const section = parse(readBuilt("privacy.html")).querySelector("section#user-survey");
    expect(section).not.toBeNull();
    expect(section?.querySelector("h2")?.text.trim()).toBe("User survey");
    expect(section?.text).toContain("contact@pypsa.org");
  });
});

describe("survey entry points", () => {
  it("renders the banner linking to /survey on the home page", () => {
    const banner = parse(readBuilt("index.html")).querySelector("#survey-banner");
    expect(banner).not.toBeNull();
    expect(banner?.hasAttribute("data-survey-banner")).toBe(true);
    expect(banner?.classList.contains("survey-banner")).toBe(true);
    expect(banner?.querySelector('a[href="/survey"]')).not.toBeNull();
    expect(banner?.querySelector("[data-survey-banner-dismiss]")).not.toBeNull();
  });

  it("renders the hero pill next to the event pill on the home page", () => {
    const root = parse(readBuilt("index.html"));
    expect(root.querySelector('[data-survey-pill][href="/survey"]')).not.toBeNull();
    expect(root.querySelector("[data-event-pill]")).not.toBeNull();
  });

  it("omits the banner on /survey and the embeds", () => {
    for (const f of ["survey.html", "embed/contributors.html"]) {
      expect(parse(readBuilt(f)).querySelector("#survey-banner"), f).toBeNull();
    }
  });
});

describe("SurveyJS bundle isolation", () => {
  const SURVEY_MARKER = /survey-core has version|SurveyModel/;
  const surveyChunks = new Set(appJsFiles().filter((f) => SURVEY_MARKER.test(readBuilt(f))));

  /** Static imports of a built JS file; dynamic `import(...)` calls are not followed. */
  const staticImports = (file: string): string[] =>
    [...readBuilt(file).matchAll(/(?:\bfrom|\bimport)\s*["'](\.{1,2}\/[^"']+\.js)["']/g)].map((m) =>
      posix.join(dirname(file), m[1]),
    );

  /** Every JS file a page loads on first paint: its scripts, preloads and inline imports, followed transitively. */
  const reachable = (page: string): Set<string> => {
    const seen = new Set<string>();
    const queue = [...readBuilt(page).matchAll(/\/_app\/[^"'\s)]+\.js/g)].map((m) => m[0].slice(1));
    while (queue.length) {
      const f = queue.pop() as string;
      if (seen.has(f)) continue;
      seen.add(f);
      queue.push(...staticImports(f));
    }
    return seen;
  };

  it("finds the SurveyJS chunk by its marker", () => {
    expect(surveyChunks.size).toBeGreaterThan(0);
  });

  it("is statically reached by no page other than /survey", () => {
    const offenders: string[] = [];
    for (const page of builtHtmlFiles()) {
      if (page === "survey.html") continue;
      for (const f of reachable(page)) if (surveyChunks.has(f)) offenders.push(`${page} -> ${f}`);
    }
    expect(offenders).toEqual([]);
  });

  it("the reachability walk is not vacuous", () => {
    expect(reachable("index.html").size).toBeGreaterThan(3);
  });
});
