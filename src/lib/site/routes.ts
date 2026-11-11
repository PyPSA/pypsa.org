import { eventsData } from "$lib/data/events";
import { roadmapData } from "$lib/data/roadmap";
import { siteConfig } from "$lib/config/meta";
import { dateRange } from "./dates";

/**
 * The single source for every public, indexable route. Sitemap, llms.txt and
 * the Markdown mirrors are generated from this list.
 *
 * `/embed/*`, `/404` and aliases are deliberately not listed.
 */
export interface RouteEntry {
  path: string;
  title: string;
  description: string;
  ogType: "website" | "article";
  ogImage?: string;
  /** ISO date, YYYY-MM-DD. */
  lastmod: string;
  mdPath: string;
}

const buildDate = new Date().toISOString().slice(0, 10);

const mdPathOf = (path: string) => (path === "/" ? "/index.md" : `${path}.md`);

const newestRoadmapDate = roadmapData
  .map((i) => i.date)
  .filter((d): d is string => !!d)
  .sort()
  .at(-1)!;

const eventDescription = (e: (typeof eventsData)[number]) =>
  `${e.title} on ${dateRange(e)}, ${e.time}.`;

type Base = Omit<RouteEntry, "mdPath" | "ogType"> & { ogType?: RouteEntry["ogType"] };

const base: Base[] = [
  { path: "/", title: siteConfig.name, description: siteConfig.description, lastmod: buildDate },
  {
    path: "/roadmap",
    title: "Roadmap — " + siteConfig.name,
    description: "What we're planning to build and a selection of what was recently shipped.",
    lastmod: newestRoadmapDate,
  },
  {
    path: "/events",
    title: "Events — " + siteConfig.name,
    description: "Upcoming and past PyPSA user meetings and events.",
    lastmod: buildDate,
  },
  ...eventsData.map((e) => ({
    path: `/events/${e.slug}`,
    title: `${e.title} — PyPSA`,
    description: eventDescription(e),
    ogImage: e.bannerImage ? siteConfig.url + e.bannerImage : undefined,
    lastmod: e.date,
  })),
  {
    path: "/contact",
    title: "Get in touch — " + siteConfig.name,
    description:
      "How to reach the PyPSA community: Discord, GitHub Discussions and Issues, the mailing list and social media.",
    lastmod: buildDate,
  },
  {
    path: "/privacy",
    title: "Privacy & Legal Notice — " + siteConfig.name,
    description: "How pypsa.org handles personal data, third-party services and cookies.",
    lastmod: buildDate,
  },
];

export const routes: RouteEntry[] = base.map((r) => ({
  ogType: "website",
  ...r,
  mdPath: mdPathOf(r.path),
}));

/** Redirect-style pages: alias path -> canonical registry path. */
export const aliases: Record<string, string> = {
  "/4th-user-meeting": "/events/4th-user-meeting",
};

export function getRoute(path: string): RouteEntry | undefined {
  return routes.find((r) => r.path === path);
}
