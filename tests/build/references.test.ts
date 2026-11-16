import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { referencesData } from "../../src/lib/data/references";
import { appJsFiles, buildPath, readBuilt } from "./helpers";

type Ref = { title: string; link: string; citations: number };

const json = (): Ref[] => JSON.parse(readFileSync(buildPath("data/references.json"), "utf8"));

it("data/references.json lists every reference", () => {
  expect(json()).toHaveLength(referencesData.length);
});

it("data/references.json drops snippet and uses_pypsa", () => {
  for (const ref of json()) {
    expect(ref).not.toHaveProperty("snippet");
    expect(ref).not.toHaveProperty("uses_pypsa");
  }
});

it("no app bundle contains the least-cited reference", () => {
  const least = [...json()].sort((a, b) => a.citations - b.citations)[0];
  expect(least.link).toBeTruthy();
  for (const file of appJsFiles()) {
    expect(readBuilt(file), file).not.toContain(least.link);
  }
});

it("index.html renders the most-cited reference", () => {
  const top = [...json()].sort((a, b) => b.citations - a.citations)[0];
  expect(readBuilt("index.html")).toContain(top.title);
});
