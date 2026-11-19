import { describe, expect, it } from "vitest";
import { contributorsData } from "./contributors";
import {
  categoryForRepo,
  type ContributorStats,
  filterByRepo,
  pageCount,
  pageSize,
  repoFromFilterParam,
  sortContributors,
  wrapPage,
} from "./community";

const tom = {
  firstName: "Tom",
  lastName: "Brown",
  totalContributions: 10,
  repoContributions: { "PyPSA/PyPSA": 1, "PyPSA/atlite": 1 },
};
const ann = {
  firstName: "Ann",
  lastName: "A",
  totalContributions: 500,
  repoContributions: { "PyPSA/PyPSA": 50, "PyPSA/atlite": 5 },
  repoPrs: { "PyPSA/PyPSA": 7 },
};
const bob = {
  firstName: "Bob",
  lastName: "B",
  totalContributions: 100,
  repoContributions: { "PyPSA/PyPSA": 20, "PyPSA/atlite": 0 },
};
const cy = { firstName: "Cy", lastName: "C" };
const fixture: ContributorStats[] = [bob, cy, ann, tom];

describe("sortContributors", () => {
  it("puts Tom Brown first, rest descending (fixture)", () => {
    const out = sortContributors(fixture);
    expect(out.map((c) => c.firstName)).toEqual(["Tom", "Ann", "Bob", "Cy"]);
    expect(out).not.toBe(fixture);
  });
  it("puts Tom Brown first, rest descending (real data)", () => {
    const out = sortContributors(contributorsData);
    expect(out[0].firstName).toBe("Tom");
    expect(out[0].lastName).toBe("Brown");
    for (let i = 2; i < out.length; i++) {
      expect(out[i - 1].totalContributions || 0).toBeGreaterThanOrEqual(
        out[i].totalContributions || 0
      );
    }
  });
});

describe("filterByRepo", () => {
  it("pins Tom Brown only for PyPSA", () => {
    expect(filterByRepo(fixture, "PyPSA").map((c) => c.firstName)).toEqual([
      "Tom",
      "Ann",
      "Bob",
    ]);
    expect(filterByRepo(fixture, "atlite").map((c) => c.firstName)).toEqual(["Ann", "Tom"]);
  });
  it("drops zero or missing repo contributions", () => {
    const names = filterByRepo(fixture, "atlite").map((c) => c.firstName);
    expect(names).not.toContain("Bob");
    expect(names).not.toContain("Cy");
  });
  it("replaces stats with repo values", () => {
    const ann2 = filterByRepo(fixture, "PyPSA").find((c) => c.firstName === "Ann")!;
    expect(ann2.totalContributions).toBe(50);
    expect(ann2.totalMergedPrs).toBe(7);
    expect(ann2.totalIssuesCreated).toBe(0);
    expect(ann2.totalReviews).toBe(0);
    expect(ann2.displayRepoOnly).toBe(true);
  });
});

describe("pageSize", () => {
  it.each([
    [639, 20, 12],
    [640, 32, 24],
    [1023, 32, 24],
    [1024, 40, 32],
    [1280, 40, 32],
  ])("width %i", (w, embed, normal) => {
    expect(pageSize(w, true)).toBe(embed);
    expect(pageSize(w, false)).toBe(normal);
  });
});

describe("paging", () => {
  it("pageCount rounds up", () => {
    expect(pageCount(33, 32)).toBe(2);
  });
  it("wraps in both directions", () => {
    expect(wrapPage(2, 1, 3)).toBe(0);
    expect(wrapPage(0, -1, 3)).toBe(2);
    expect(wrapPage(0, 1, 0)).toBe(0);
  });
});

describe("categories and filter param", () => {
  it("categoryForRepo", () => {
    expect(categoryForRepo("linopy")).toBe("framework");
    expect(categoryForRepo("PyPSA-Eur")).toBe("models");
    expect(categoryForRepo("bogus")).toBeNull();
  });
  it("repoFromFilterParam", () => {
    expect(repoFromFilterParam("PyPSA-Eur")).toBe("PyPSA-Eur");
    expect(repoFromFilterParam("bogus")).toBeNull();
    expect(repoFromFilterParam("constructor")).toBeNull();
    expect(repoFromFilterParam(null)).toBeNull();
  });
});
