// Pure filtering, sorting and paging logic for the Community section.

// Maps display name to repo path in the contributor data
export const repoMap = {
  PyPSA: "PyPSA/PyPSA",
  atlite: "PyPSA/atlite",
  linopy: "PyPSA/linopy",
  powerplantmatching: "PyPSA/powerplantmatching",
  "technology-data": "PyPSA/technology-data",
  "PyPSA-Eur": "PyPSA/pypsa-eur",
  "PyPSA-Earth": "pypsa-meets-earth/pypsa-earth",
  "PyPSA-USA": "PyPSA/pypsa-usa",
  "PyPSA-DE": "PyPSA/pypsa-de",
} as const;

export type RepoName = keyof typeof repoMap;
export type Category = "framework" | "models";

export const frameworkRepos: readonly RepoName[] = [
  "PyPSA",
  "atlite",
  "linopy",
  "powerplantmatching",
  "technology-data",
];
export const modelRepos: readonly RepoName[] = ["PyPSA-Eur", "PyPSA-Earth", "PyPSA-USA", "PyPSA-DE"];

export interface ContributorStats {
  firstName: string;
  lastName: string;
  totalContributions?: number;
  totalMergedPrs?: number;
  totalIssuesCreated?: number;
  totalReviews?: number;
  repoContributions?: Record<string, number | undefined>;
  repoPrs?: Record<string, number | undefined>;
  repoIssues?: Record<string, number | undefined>;
  repoReviews?: Record<string, number | undefined>;
}

const isTomBrown = (c: ContributorStats) => c.firstName === "Tom" && c.lastName === "Brown";

/** Tom Brown first, then descending total contributions. Returns a new array. */
export function sortContributors<T extends ContributorStats>(list: readonly T[]): T[] {
  return [...list].sort((a, b) => {
    if (isTomBrown(a)) return -1;
    if (isTomBrown(b)) return 1;
    return (b.totalContributions || 0) - (a.totalContributions || 0);
  });
}

/** Contributors with contributions in the repo, stats replaced by the repo values. */
export function filterByRepo<T extends ContributorStats>(
  list: readonly T[],
  repoName: RepoName
): (T & { displayRepoOnly: true })[] {
  const repoPath = repoMap[repoName];
  return list
    .filter((c) => (c.repoContributions?.[repoPath] ?? 0) > 0)
    .map((c) => ({
      ...c,
      totalContributions: c.repoContributions?.[repoPath] || 0,
      totalMergedPrs: c.repoPrs?.[repoPath] || 0,
      totalIssuesCreated: c.repoIssues?.[repoPath] || 0,
      totalReviews: c.repoReviews?.[repoPath] || 0,
      displayRepoOnly: true as const,
    }))
    .sort((a, b) => {
      if (repoName === "PyPSA") {
        if (isTomBrown(a)) return -1;
        if (isTomBrown(b)) return 1;
      }
      return b.totalContributions - a.totalContributions;
    });
}

export function pageSize(width: number, embedMode: boolean): number {
  if (embedMode) {
    if (width < 640) return 20;
    if (width < 1024) return 32;
    return 40;
  }
  if (width < 640) return 12;
  if (width < 1024) return 24;
  return 32;
}

export function pageCount(total: number, perPage: number): number {
  return Math.ceil(total / perPage);
}

export function wrapPage(page: number, delta: number, total: number): number {
  if (total <= 0) return 0;
  return (page + delta + total) % total;
}

export function categoryForRepo(name: string): Category | null {
  if ((frameworkRepos as readonly string[]).includes(name)) return "framework";
  if ((modelRepos as readonly string[]).includes(name)) return "models";
  return null;
}

/** Valid `?filter=` value or null; only own keys of repoMap count. */
export function repoFromFilterParam(param: string | null): RepoName | null {
  return param && Object.hasOwn(repoMap, param) ? (param as RepoName) : null;
}
