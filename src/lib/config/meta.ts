export const siteConfig = {
  name: "PyPSA - Python for Power System Analysis",
  description:
    "PyPSA is an open-source Python framework for optimizing modern power systems with renewable energy, storage, and multi-sector coupling. Perfect for researchers and energy planners.",
  url: "https://pypsa.org",
  ogImage: "https://pypsa.org/img/og-card.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  logo: "https://pypsa.org/favicon.svg",
  links: {
    github: "https://github.com/PyPSA",
  },
  social: {
    github: "https://github.com/pypsa",
    discord: "https://discord.gg/AnuJBk23FU",
    youtube: "https://www.youtube.com/@pypsa-official",
    linkedin: "https://www.linkedin.com/company/pypsa",
    mastodon: "https://mastodon.social/@pypsa",
    bluesky: "https://bsky.app/profile/pypsa-org.bsky.social",
  },
  keywords: [
    "PyPSA",
    "Python",
    "Power System Analysis",
    "Energy Modeling",
    "Renewable Energy",
    "Open Source",
    "Optimization",
    "Grid Planning",
    "atlite",
    "linopy",
    "powerplantmatching",
  ],
};

/** Production URL for a route path, where only `/` keeps its slash. */
export const absoluteUrl = (path: string) =>
  path === "/" ? `${siteConfig.url}/` : siteConfig.url + path;

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: "PyPSA community",
    url: siteConfig.url,
    logo: siteConfig.logo,
    sameAs: Object.values(siteConfig.social),
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@type": "SoftwareApplication",
    "@id": `${siteConfig.url}/#software`,
    name: "PyPSA",
    description: siteConfig.description,
    url: siteConfig.url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Cross-platform",
    license: "https://opensource.org/licenses/MIT",
    sameAs: [
      "https://github.com/PyPSA/PyPSA",
      "https://pypi.org/project/pypsa/",
      "https://docs.pypsa.org",
      "https://www.wikidata.org/wiki/Q140793952",
    ],
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function jsonLdGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [softwareApplicationJsonLd(), organizationJsonLd()],
  };
}
