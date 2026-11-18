import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { securityHeaders } from "../../src/worker-headers";
import { BUILD_DIR, buildPath, builtHtmlFiles, parse, readBuilt } from "./helpers";

/** `_headers` parsed into URL pattern → header name → value. */
function parseHeaders(text: string): Record<string, Record<string, string>> {
  const rules: Record<string, Record<string, string>> = {};
  let current: Record<string, string> | undefined;
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      current = rules[line.trim()] = {};
    } else {
      const i = line.indexOf(":");
      current![line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return rules;
}

const wrangler = ts.parseConfigFileTextToJson(
  "wrangler.jsonc",
  readFileSync(join(process.cwd(), "wrangler.jsonc"), "utf8"),
).config as { assets: { run_worker_first: string[] } };

/** Cloudflare glob to RegExp, `*` matching any run of characters. */
const globRe = (glob: string) =>
  new RegExp(`^${glob.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);

const negations = wrangler.assets.run_worker_first
  .filter((g) => g.startsWith("!"))
  .map((g) => globRe(g.slice(1)));

const skipsWorker = (url: string) => negations.some((re) => re.test(url));

/** Every file under `build/` that Cloudflare serves, as a URL path. */
function servedFiles(): string[] {
  // Wrangler never uploads `.assetsignore` itself.
  const ignored = new Set([
    ".assetsignore",
    ...readBuilt(".assetsignore")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#")),
  ]);
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push("/" + relative(BUILD_DIR, full).split("\\").join("/"));
    }
  };
  walk(buildPath(""));
  return out.filter((p) => !ignored.has(p.slice(1)));
}

describe("deploy config", () => {
  it("ships _headers and .assetsignore, with immutable caching for hashed assets", () => {
    expect(existsSync(buildPath("_headers"))).toBe(true);
    expect(existsSync(buildPath(".assetsignore"))).toBe(true);
    expect(parseHeaders(readBuilt("_headers"))["/_app/immutable/*"]).toEqual({
      "Cache-Control": "public, max-age=31536000, immutable",
    });
  });

  it("keeps the /* block of _headers equal to the Worker's headers", () => {
    expect(parseHeaders(readBuilt("_headers"))["/*"]).toEqual(securityHeaders("/"));
  });

  it("keeps every static file away from the Worker", () => {
    const pages = (p: string) => p.endsWith(".html") && p !== "/404.html";
    const uncovered = servedFiles().filter((p) => !pages(p) && !skipsWorker(p));
    expect(uncovered).toEqual([]);
  });

  it("runs the Worker on every page route", () => {
    const routes = builtHtmlFiles()
      .filter((f) => f !== "404.html")
      .map((f) => (f === "index.html" ? "/" : "/" + f.replace(/\.html$/, "")));
    expect(routes.filter(skipsWorker)).toEqual([]);
  });
});

describe("content security policy", () => {
  const policy = securityHeaders("/")["Content-Security-Policy"];
  const sources = Object.fromEntries(
    policy.split(";").map((d) => {
      const [name, ...values] = d.trim().split(/\s+/);
      return [name, values];
    }),
  ) as Record<string, string[]>;

  /** True when a CSP source list allows `origin`, honouring `*.` host wildcards. */
  const allows = (list: string[], origin: string) =>
    list.some((s) => s === origin || (s.includes("*.") && globRe(s).test(origin)));

  const externalOrigins = (html: string, selector: string, attr: string) =>
    parse(html)
      .querySelectorAll(selector)
      .map((el) => el.getAttribute(attr))
      .filter((v): v is string => !!v && /^https?:\/\//.test(v))
      .map((v) => new URL(v).origin);

  const htmlFiles = [
    ...builtHtmlFiles(),
    ...readdirSync(buildPath("explore")).map((f) => `explore/${f}`),
  ];

  it.each(htmlFiles)("allows every external source of %s", (file) => {
    const html = readBuilt(file);
    const checks: [string, string, string][] = [
      ["script[src]", "src", "script-src"],
      ["img[src]", "src", "img-src"],
      ["iframe[src]", "src", "frame-src"],
      ["link[rel=stylesheet]", "href", "style-src"],
    ];
    for (const [selector, attr, directive] of checks) {
      for (const origin of externalOrigins(html, selector, attr)) {
        expect(allows(sources[directive], origin), `${directive} ${origin}`).toBe(true);
      }
    }
  });
});
