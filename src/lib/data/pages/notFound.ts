import type { PageData } from "./types";

export const notFoundPage: PageData = {
  eyebrow: "404",
  title: "Page not found",
  lead: ["The page you are looking for does not exist or has moved."],
  sections: [
    {
      id: "next",
      heading: "Where to go next",
      items: [
        [{ label: "pypsa.org home", href: "/" }, ": overview of PyPSA and its ecosystem."],
        [{ label: "Documentation", href: "https://docs.pypsa.org" }, ": tutorials, examples and API reference."],
        [{ label: "Sitemap", href: "/sitemap.xml" }, ": every page on this site."],
        [{ label: "llms.txt", href: "/llms.txt" }, ": a machine-readable site index."],
      ],
    },
  ],
};
