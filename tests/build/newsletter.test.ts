import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "node-html-parser";
import { BUILD_DIR, builtHtmlFiles, readBuilt } from "./helpers";

const NO_BRAND = [
  "newsletter.html",
  "newsletter/confirmed.html",
  "privacy.html",
  "contact.html",
  "newsletter.md",
  "newsletter/confirmed.md",
  "privacy.md",
  "contact.md",
];

describe("newsletter pages", () => {
  it("builds the signup page with the form and the confirmed page", () => {
    for (const f of ["newsletter.html", "newsletter/confirmed.html"])
      expect(existsSync(join(BUILD_DIR, f)), f).toBe(true);
    const root = parse(readBuilt("newsletter.html"));
    expect(root.querySelector("main form, article form")).not.toBeNull();
    const confirmed = parse(readBuilt("newsletter/confirmed.html"));
    const hrefs = confirmed.querySelectorAll("article a").map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/events");
  });

  it("builds the Markdown mirrors", () => {
    for (const f of ["newsletter.md", "newsletter/confirmed.md"])
      expect(existsSync(join(BUILD_DIR, f)), f).toBe(true);
  });

  it("links /newsletter from /contact", () => {
    const hrefs = parse(readBuilt("contact.html")).querySelectorAll("a").map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/newsletter");
  });

  it("names Brevo and Turnstile in the privacy policy", () => {
    const text = parse(readBuilt("privacy.html")).text;
    expect(text).toContain("Brevo");
    expect(text).toContain("Turnstile");
    expect(text).not.toContain("There is no contact form or newsletter");
  });

  it.each(NO_BRAND)("%s never mentions pypsalabs", (f) => {
    expect(readBuilt(f).toLowerCase()).not.toContain("pypsalabs");
  });

  it("keeps pypsalabs out of every footer", () => {
    for (const f of builtHtmlFiles()) {
      const footer = parse(readBuilt(f)).querySelector("footer");
      expect(footer?.outerHTML.toLowerCase() ?? "", f).not.toContain("pypsalabs");
    }
  });
});
