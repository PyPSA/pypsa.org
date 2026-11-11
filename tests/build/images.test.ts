import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { avatarIds } from "../../scripts/avatar-ids.mjs";
import { buildPath, builtHtmlFiles, imgTags, readBuilt } from "./helpers";

describe("image pipeline", () => {
  it("serves project WebPs at most 800 px wide", async () => {
    const dir = buildPath("img/projects");
    const files = readdirSync(dir).filter((f) => f.endsWith(".webp"));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const { width } = await sharp(join(dir, f)).metadata();
      expect(width, f).toBeLessThanOrEqual(800);
    }
  });

  it("ships one avatar per contributor and event id", () => {
    const built = new Set(readdirSync(buildPath("img/avatars")));
    const ids = avatarIds();
    expect(ids.size).toBeGreaterThan(0);
    const missing = [...ids].filter((id) => !built.has(`${id}.webp`));
    expect(missing).toEqual([]);
  });

  it("references no GitHub avatar host in built HTML", () => {
    const offenders = builtHtmlFiles().filter((f) =>
      readBuilt(f).includes("avatars.githubusercontent.com"),
    );
    expect(offenders).toEqual([]);
  });

  it("gives every built <img> width, height, loading and async decoding", () => {
    const bad: string[] = [];
    for (const f of builtHtmlFiles()) {
      for (const img of imgTags(readBuilt(f))) {
        if (
          !img.width ||
          !img.height ||
          !["eager", "lazy"].includes(img.loading) ||
          img.decoding !== "async"
        )
          bad.push(`${f}: ${img.src}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("loads only the navbar logo and the event banner eagerly", () => {
    const bad: string[] = [];
    for (const f of builtHtmlFiles()) {
      for (const img of imgTags(readBuilt(f))) {
        if (img.loading !== "eager") continue;
        const isLogo = img.src === "/img/pypsa-logo.svg";
        const isBanner = f.startsWith("events/") && !!img.src?.includes("banner");
        if (!isLogo && !isBanner) bad.push(`${f}: ${img.src}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("points every built avatar src at a file under build/", () => {
    const missing: string[] = [];
    let seen = 0;
    for (const f of builtHtmlFiles()) {
      for (const { src } of imgTags(readBuilt(f))) {
        if (!src?.startsWith("/img/avatars/") || !src.endsWith(".webp")) continue;
        seen++;
        if (!existsSync(buildPath(src.slice(1)))) missing.push(`${f}: ${src}`);
      }
    }
    expect(seen).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });
});
