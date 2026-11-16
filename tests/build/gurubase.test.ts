import { expect, it } from "vitest";
import { readBuilt } from "./helpers";

it("gurubase widget injects when idle, not on DOMContentLoaded", () => {
  const js = readBuilt("js/gurubase-widget.js");
  expect(js).toContain("requestIdleCallback");
  expect(js).not.toContain("DOMContentLoaded");
});
