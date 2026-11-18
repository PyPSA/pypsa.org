import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const community = "src/lib/components/Community.svelte";
const navbar = "src/lib/components/Navbar.svelte";

const css = execFileSync(
  "npx",
  [
    "--no-install",
    "tailwindcss",
    "-c",
    "tailwind.config.ts",
    "-i",
    "src/app.css",
    "--content",
    `${community},${navbar}`,
  ],
  { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }
);

function classesOf(file, pattern) {
  const match = readFileSync(`${root}/${file}`, "utf8").match(pattern);
  assert.ok(match, `${pattern} not found in ${file}`);
  return match[1].split(/\s+/);
}

function zIndexOf(className) {
  const escaped = className.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
  const selector = escaped.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rule = css.match(new RegExp(`\\.${selector}(?::hover)?\\s*\\{[^}]*z-index:\\s*(-?\\d+)`));
  assert.ok(rule, `no z-index rule compiled for ${className}`);
  return Number(rule[1]);
}

test("a hovered community card stays below the sticky navbar", () => {
  const card = classesOf(community, /class="(carousel-item[^"]*)"/).find(
    (c) => c === "contributor-item" || c.startsWith("hover:z-")
  );
  const header = classesOf(navbar, /<header[^>]*?class="([^"]*)"/s).find((c) => /^z-/.test(c));
  assert.ok(card, "carousel-item has no hover:z-* class");
  assert.ok(header, "navbar header has no z-* class");
  assert.ok(zIndexOf(card) > 0, `card ${card} must rise above its sibling cards`);
  assert.ok(zIndexOf(card) < zIndexOf(header), `card ${card} must sit below navbar ${header}`);
});
