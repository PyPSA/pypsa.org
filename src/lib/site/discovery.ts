import { absoluteUrl, siteConfig } from "$lib/config/meta";
import { markdownFor } from "./markdown";
import { routes } from "./routes";

export function llmsTxt(): string {
  const pages = routes.map((r) => `- [${r.title}](${siteConfig.url}${r.mdPath}): ${r.description}`);
  return [
    "# PyPSA",
    "",
    `> ${siteConfig.description}`,
    "",
    "## Pages",
    "",
    ...pages,
    "",
    "## Docs",
    "",
    "- [PyPSA documentation](https://docs.pypsa.org): User guide, examples and API reference.",
    "",
  ].join("\n");
}

export function llmsFullTxt(): string {
  const bodies = routes.map((r) => markdownFor(r.path).trim());
  return bodies.join("\n\n---\n\n") + "\n";
}

export function sitemapXml(): string {
  const urls = routes.map(
    (r) =>
      `  <url>\n    <loc>${absoluteUrl(r.path)}</loc>\n    <lastmod>${r.lastmod}</lastmod>\n  </url>`
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}
