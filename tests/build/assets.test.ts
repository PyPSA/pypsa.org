import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BUILD_DIR, builtHtmlFiles, readBuilt } from "./helpers";

describe("self-hosted brand assets", () => {
  it("references raw.githubusercontent.com from no built HTML", () => {
    const offenders = builtHtmlFiles().filter((f) => readBuilt(f).includes("raw.githubusercontent.com"));
    expect(offenders).toEqual([]);
  });

  it("ships favicon.ico and favicon.svg", () => {
    expect(existsSync(join(BUILD_DIR, "favicon.ico"))).toBe(true);
    expect(existsSync(join(BUILD_DIR, "favicon.svg"))).toBe(true);
  });

  it("renders og-card.png at 1200x630", () => {
    const png = readFileSync(join(BUILD_DIR, "img/og-card.png"));
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.subarray(12, 16).toString()).toBe("IHDR");
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
