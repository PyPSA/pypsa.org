import { describe, expect, it } from "vitest";
import { contentRatio, readBuilt } from "./helpers";

describe("homepage content ratio", () => {
  it("has visible text of at least 5% of the HTML bytes", () => {
    expect(contentRatio(readBuilt("index.html"))).toBeGreaterThanOrEqual(0.05);
  });
});
