import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parse as parseHtml } from "node-html-parser";

export const BUILD_DIR = join(process.cwd(), "build");

/** Paths (relative to `build/`, posix separators) of every built `.html` file, excluding `explore/`. */
export function builtHtmlFiles(): string[] {
  return walkBuilt(BUILD_DIR, ".html").filter((f) => !f.startsWith("explore/"));
}

/** Sorted paths (relative to `build/`, posix separators) of files under `root` ending in `ext`. */
function walkBuilt(root: string, ext: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(ext)) out.push(relative(BUILD_DIR, full).split("\\").join("/"));
    }
  };
  if (existsSync(root)) walk(root);
  return out.sort();
}

/** Reads one built file, given its path relative to `build/`, as UTF-8. */
export function readBuilt(path: string): string {
  return readFileSync(join(BUILD_DIR, path), "utf8");
}

/** Absolute path of a file under `build/`. Throws when `build/` is missing. */
export function buildPath(rel: string): string {
  if (!existsSync(BUILD_DIR)) throw new Error("run npm run build first");
  return join(BUILD_DIR, rel);
}

/** Attributes of each `<img>` in an HTML string. */
export function imgTags(html: string): Record<string, string>[] {
  return parseHtml(html)
    .querySelectorAll("img")
    .map((img) => ({ ...img.attributes }));
}

/** Paths (relative to `build/`, posix separators) of every `build/_app/**\/*.js` file. */
export function appJsFiles(): string[] {
  return walkBuilt(join(BUILD_DIR, "_app"), ".js");
}

/** Parses an HTML string with `node-html-parser`. */
export function parse(html: string) {
  return parseHtml(html);
}

/**
 * Visible text bytes over HTML bytes.
 *
 * Visible text is the text left after dropping `script`, `style`, `svg`,
 * `template` and `noscript` elements and collapsing whitespace runs to a
 * single space. Both sizes are UTF-8 byte lengths.
 */
export function contentRatio(html: string): number {
  const root = parseHtml(html);
  root.querySelectorAll("script, style, svg, template, noscript").forEach((n) => n.remove());
  const text = root.textContent.replace(/\s+/g, " ").trim();
  return Buffer.byteLength(text) / Buffer.byteLength(html);
}
