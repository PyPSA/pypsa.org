import { siteConfig, absoluteUrl } from "$lib/config/meta";
import { eventsData, type EventData, type AgendaItem } from "$lib/data/events";
import { roadmapData } from "$lib/data/roadmap";
import { contributorsData } from "$lib/data/contributors";
import { referencesData } from "$lib/data/references";
import { hero } from "$lib/data/home/hero";
import { featuresSection, featureCategories, featureTabs } from "$lib/data/home/features";
import { ecosystemSection, ecosystemProjects } from "$lib/data/home/ecosystem";
import { modelsSection, modelProjects } from "$lib/data/home/models";
import { FAQList, faqSection } from "$lib/data/home/faq";
import { communitySection } from "$lib/data/home/community";
import { referencesSection } from "$lib/data/home/references";
import { contactPage } from "$lib/data/pages/contact";
import { privacyPage } from "$lib/data/pages/privacy";
import { notFoundPage } from "$lib/data/pages/notFound";
import type { Inline, PageData } from "$lib/data/pages/types";
import { dateRange } from "./dates";
import { getRoute } from "./routes";

/**
 * Markdown mirrors of the public pages, generated from the same data modules
 * the Svelte pages render.
 *
 * Path contract (consumed by the phase 3 Worker, which serves a mirror when a
 * client sends `Accept: text/markdown`):
 * - `/`              -> `/index.md`
 * - `/<path>`        -> `/<path>.md`
 * - `/events/<slug>` -> `/events/<slug>.md`
 * - the 404 page     -> `/404.md`
 *
 * Canonical URLs have no trailing slash, except `/`.
 *
 * Every mirror opens with `# <title>`, a summary line and the canonical URL.
 */

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/** Site-relative paths become absolute; everything else is returned unchanged. */
const abs = (href: string) => (href.startsWith("/") ? absoluteUrl(href) : href);

const collapse = (s: string) => s.replace(/\s+/g, " ").trim();

/** Converts the HTML snippets in the data modules: links to Markdown, other tags dropped. */
function htmlToMd(html: string): string {
  return html
    .replace(
      /<a\s[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g,
      (_, href, text) => `[${collapse(text)}](${abs(href)})`
    )
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (e) => ENTITIES[e]);
}

function inline(parts: Inline): string {
  return parts.map((p) => (typeof p === "string" ? p : `[${p.label}](${abs(p.href)})`)).join("");
}

function header(title: string, summary: string, path?: string): string {
  const canonical = path === undefined ? "" : `\nCanonical URL: ${absoluteUrl(path)}\n`;
  return `# ${title}\n\n${summary}\n${canonical}`;
}

const joinBlocks = (blocks: string[]) =>
  blocks
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd() + "\n";

const bullets = (lines: string[]) => lines.map((l) => `- ${l}`).join("\n") + "\n";

function pageMarkdown(page: PageData, path: string): string {
  const route = getRoute(path)!;
  const blocks = [header(route.title, route.description, path)];
  blocks.push(`${inline(page.lead)}\n`);
  for (const s of page.sections) {
    blocks.push(`## ${s.heading}\n`);
    for (const p of s.paragraphs ?? []) blocks.push(`${inline(p)}\n`);
    if (s.items) blocks.push(bullets(s.items.map(inline)));
  }
  return joinBlocks(blocks);
}

function projectBlock(p: {
  name: string;
  description: string;
  image: string;
  githubUrl: string;
  docsUrl?: string;
  websiteUrl?: string;
  exploreUrl?: string;
  institutions?: { name: string; url: string }[];
}): string {
  const links = [
    `[GitHub](${p.githubUrl})`,
    p.docsUrl && `[Docs](${p.docsUrl})`,
    p.websiteUrl && `[Website](${p.websiteUrl})`,
    p.exploreUrl && `[Explore](${abs(p.exploreUrl)})`,
  ].filter(Boolean);
  const inst = p.institutions?.length
    ? ` Institutions: ${p.institutions.map((i) => `[${i.name}](${i.url})`).join(", ")}.`
    : "";
  return `- **${p.name}**: ${p.description}. ${links.join(" · ")}.${inst}`.replace(/\.\. /g, ". ");
}

/** The references the homepage shows: the most cited publications. */
const HOME_REFERENCES = 10;
/** Contributors named in the community summary. */
const HOME_CONTRIBUTORS = 10;

function homeMarkdown(): string {
  const route = getRoute("/")!;
  const blocks = [header(route.title, route.description, "/")];

  blocks.push(`${hero.lead.line1} ${hero.lead.line2}\n`);
  blocks.push(
    bullets([
      `[${hero.primaryCta.label}](${hero.primaryCta.href})`,
      `[${hero.secondaryCta.label}](${hero.secondaryCta.href})`,
      `${hero.event.label}: [${hero.event.text}](${abs(hero.event.href)})`,
    ])
  );

  blocks.push(`## ${featuresSection.heading}\n`, `${collapse(featuresSection.lead)}\n`);
  for (const tab of featureTabs) {
    blocks.push(`### ${tab.label}\n`);
    blocks.push(
      bullets(
        featureCategories[tab.id].map(
          (f) => `**${f.title}**: ${f.description}${f.docsUrl ? ` ([docs](${f.docsUrl}))` : ""}`
        )
      )
    );
  }

  blocks.push(`## ${ecosystemSection.heading}\n`, `${ecosystemSection.lead}.\n`);
  blocks.push(ecosystemProjects.map(projectBlock).join("\n") + "\n");

  blocks.push(`## ${modelsSection.heading}\n`, `${modelsSection.lead}.\n`);
  blocks.push(modelProjects.map(projectBlock).join("\n") + "\n");

  blocks.push(
    `## ${communitySection.heading}\n`,
    `${communitySection.lead}. ${contributorsData.length} contributors are listed on the site; ` +
      `the most active are:\n`
  );
  const top = [...contributorsData]
    .sort((a, b) => (b.totalContributions || 0) - (a.totalContributions || 0))
    .slice(0, HOME_CONTRIBUTORS);
  blocks.push(
    bullets(
      top.map((c) => {
        const gh = c.socialNetworks?.find((n) => n.name === "GitHub");
        const name = `${c.firstName} ${c.lastName}`.trim();
        return gh ? `[${name}](${gh.url})` : name;
      })
    )
  );
  blocks.push(`Join the conversation on [Discord](${siteConfig.social.discord}).\n`);

  blocks.push(
    `## ${referencesSection.heading}\n`,
    `${collapse(referencesSection.leadBefore)} [${referencesSection.scholarLabel}](${referencesSection.scholarHref}). ` +
      `The most cited publications:\n`
  );
  const refs = [...referencesData]
    .sort((a, b) => b.citations - a.citations)
    .slice(0, HOME_REFERENCES);
  blocks.push(
    bullets(
      refs.map((r) => `[${r.title}](${r.link}) (${r.year}, ${r.citations} citations): ${r.authors}`)
    )
  );

  blocks.push(`## ${faqSection.heading}\n`);
  for (const f of FAQList) blocks.push(`### ${f.question}\n`, `${htmlToMd(f.answer)}\n`);
  blocks.push(
    `${faqSection.moreLabel} [${faqSection.moreLinkLabel}](${faqSection.moreLinkHref}).\n`
  );

  return joinBlocks(blocks);
}

function roadmapMarkdown(): string {
  const route = getRoute("/roadmap")!;
  const blocks = [header(route.title, route.description, "/roadmap")];
  const item = (i: (typeof roadmapData)[number]) => {
    const meta = [i.version, i.date].filter(Boolean).join(", ");
    const title = i.link ? `[${i.title}](${i.link})` : i.title;
    return `**${title}**${meta ? ` (${meta})` : ""}: ${i.description}`;
  };
  blocks.push("## Planned\n", bullets(roadmapData.filter((i) => !i.date).map(item)));
  blocks.push(
    "## Recently shipped\n",
    bullets(
      roadmapData
        .filter((i) => i.date)
        .sort((a, b) => b.date!.localeCompare(a.date!))
        .map(item)
    )
  );
  return joinBlocks(blocks);
}

function eventsIndexMarkdown(): string {
  const route = getRoute("/events")!;
  const blocks = [header(route.title, route.description, "/events")];
  const line = (e: EventData) =>
    `[${e.title}](${absoluteUrl("/events/" + e.slug)}): ${dateRange(e)}, ${e.time}, ${e.location}`;
  const upcoming = eventsData
    .filter((e) => e.status === "upcoming")
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = eventsData
    .filter((e) => e.status === "past")
    .sort((a, b) => b.date.localeCompare(a.date));
  if (upcoming.length) blocks.push("## Upcoming events\n", bullets(upcoming.map(line)));
  if (past.length) blocks.push("## Past events\n", bullets(past.map(line)));
  return joinBlocks(blocks);
}

function agendaLines(items: AgendaItem[]): string[] {
  return items.map((a) => {
    const when = a.time ? `${a.time} ` : "";
    const who = a.speaker ? ` (${a.speaker}${a.affiliation ? `, ${a.affiliation}` : ""})` : "";
    const points = a.points?.length
      ? `\n${a.points.map((p) => `  - ${htmlToMd(p)}`).join("\n")}`
      : "";
    return `${when}${htmlToMd(a.title)}${who}${points}`;
  });
}

function eventMarkdown(e: EventData): string {
  const path = `/events/${e.slug}`;
  const route = getRoute(path)!;
  const blocks = [header(route.title, route.description, path)];
  blocks.push(
    bullets([
      `Date: ${dateRange(e)}`,
      `Time: ${e.time}`,
      `Location: ${e.location}`,
      `Status: ${e.status === "upcoming" ? "upcoming" : "past"}`,
      `Format: ${e.isOnline ? "online" : "in person"}`,
    ])
  );
  blocks.push(`${htmlToMd(e.introHtml)}\n`);

  const links = [
    e.status === "upcoming" && e.registrationUrl && `[Register](${e.registrationUrl})`,
    e.status === "upcoming" && e.talkProposalUrl && `[Propose a talk](${e.talkProposalUrl})`,
  ].filter(Boolean);
  if (links.length) {
    const deadline = e.talkProposalDeadline
      ? ` Talk proposal deadline: ${e.talkProposalDeadline}.`
      : "";
    blocks.push(`${links.join(" · ")}${deadline}\n`);
  }

  if (e.agenda?.length) {
    blocks.push("## Agenda\n");
    const simple = e.agenda.every((a) => !a.speaker && !a.time);
    if (simple) blocks.push(bullets(agendaLines(e.agenda)));
    else {
      for (const a of e.agenda) {
        if (a.type === "special") {
          blocks.push(`- ${a.time ? `${a.time} ` : ""}${a.title}\n`);
          continue;
        }
        const who = a.speaker ? `${a.speaker}${a.affiliation ? `, ${a.affiliation}` : ""}` : "";
        blocks.push(`### ${a.time ? `${a.time} ` : ""}${htmlToMd(a.title)}\n`);
        if (who) blocks.push(`Speaker: ${who}\n`);
        if (a.abstract) blocks.push(`${htmlToMd(a.abstract)}\n`);
        const extra = [
          a.videoId && `[Recording](https://www.youtube.com/watch?v=${a.videoId})`,
          a.linkedin && `[LinkedIn](${a.linkedin})`,
          a.website && `[Website](${a.website})`,
          ...(a.links ?? []).map((l) => `[${l}](${l})`),
        ].filter(Boolean);
        if (extra.length) blocks.push(`${extra.join(" · ")}\n`);
      }
    }
  }

  if (e.people?.length) {
    blocks.push("## Participants\n", bullets(e.people.map((p) => `[${p.name}](${p.url})`)));
  }
  if (e.videos.length) {
    blocks.push(
      "## Recordings\n",
      bullets(e.videos.map((v) => `[${v.title}](https://www.youtube.com/watch?v=${v.videoId})`))
    );
  }

  const contact = e.contactHtml
    ? htmlToMd(e.contactHtml)
    : `Contact ${e.contactName} (${e.contactHandle}) at ${e.contactEmail}.`;
  blocks.push("## Contact\n", `${contact}\n`);
  blocks.push(`Licence: ${e.license}.\n`);
  return joinBlocks(blocks);
}

/** Markdown for a registry route; throws when `path` has no mirror so the build fails. */
export function markdownFor(path: string): string {
  const route = getRoute(path);
  if (!route) throw new Error(`No Markdown mirror for ${path}`);
  if (path === "/") return homeMarkdown();
  if (path === "/roadmap") return roadmapMarkdown();
  if (path === "/events") return eventsIndexMarkdown();
  if (path === "/contact") return pageMarkdown(contactPage, path);
  if (path === "/privacy") return pageMarkdown(privacyPage, path);
  const event = eventsData.find((e) => `/events/${e.slug}` === path);
  if (!event) throw new Error(`No Markdown mirror for ${path}`);
  return eventMarkdown(event);
}

/** Markdown for the 404 page (`/404.md`), which lists no canonical URL. */
export function notFoundMarkdown(): string {
  const p = notFoundPage;
  const blocks = [header(p.title, inline(p.lead))];
  for (const s of p.sections) {
    blocks.push(`## ${s.heading}\n`);
    if (s.items) blocks.push(bullets(s.items.map(inline)));
  }
  return joinBlocks(blocks);
}
