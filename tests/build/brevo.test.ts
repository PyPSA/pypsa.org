import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("brevo templates and scripts", () => {
  it("DOI template has the confirm link and no unsubscribe", () => {
    const html = read("brevo/doi.html");
    expect(html).toContain("{{ doubleoptin }}");
    expect(html).not.toContain("{{ unsubscribe }}");
  });

  it("campaign template has the unsubscribe link and the content marker", () => {
    const html = read("brevo/campaign.html");
    expect(html).toContain("{{ unsubscribe }}");
    expect(html).toContain("<!-- CONTENT -->");
  });

  it("both templates link the privacy page and carry the postal line", () => {
    for (const f of ["brevo/doi.html", "brevo/campaign.html"]) {
      const html = read(f);
      expect(html, f).toContain("https://pypsa.org/privacy");
      expect(html, f).toContain("PyPSA Labs gGmbH, Mertensstr. 16A, 13587 Berlin");
    }
  });

  it("mentions no pypsalabs anywhere under brevo/ or in the scripts", () => {
    const files = [
      ...readdirSync(join(ROOT, "brevo")).map((f) => `brevo/${f}`),
      "scripts/brevo-sync.mjs",
      "scripts/brevo-campaign.mjs",
    ];
    for (const f of files) expect(read(f).toLowerCase(), f).not.toContain("pypsalabs");
  });

  it("ships the scripts, env example and npm scripts", () => {
    for (const f of ["scripts/brevo-sync.mjs", "scripts/brevo-campaign.mjs", ".env.example"])
      expect(existsSync(join(ROOT, f)), f).toBe(true);
    const pkg = JSON.parse(read("package.json")).scripts;
    expect(pkg["brevo:sync"]).toBe("node --env-file=.env scripts/brevo-sync.mjs");
    expect(pkg["brevo:campaign"]).toBe("node --env-file=.env scripts/brevo-campaign.mjs");
  });
});
