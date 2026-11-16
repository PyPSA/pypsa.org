import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { BUILD_DIR, builtHtmlFiles } from "./helpers";

it("build/index.html exists", () => {
  expect(existsSync(join(BUILD_DIR, "index.html"))).toBe(true);
  expect(builtHtmlFiles()).toContain("index.html");
});
