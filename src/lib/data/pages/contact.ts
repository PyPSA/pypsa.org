import { siteConfig } from "$lib/config/meta";
import { DOCS_BASE_URL } from "../../config";
import type { PageData } from "./types";

export const contactPage: PageData = {
  eyebrow: "Community",
  title: "Get in touch",
  lead: [
    "PyPSA is developed in the open by a community of researchers, engineers and users. Pick the channel that fits your question.",
  ],
  sections: [
    {
      id: "help",
      heading: "Questions and bug reports",
      items: [
        [
          { label: "Discord", href: siteConfig.social.discord },
          ": quick questions and chat with other PyPSA users.",
        ],
        [
          { label: "GitHub Discussions", href: "https://github.com/PyPSA/PyPSA/discussions" },
          ": usage questions and ideas.",
        ],
        [
          { label: "GitHub Issues", href: "https://github.com/PyPSA/PyPSA/issues" },
          ": bug reports and feature requests.",
        ],
      ],
    },
    {
      id: "news",
      heading: "News and announcements",
      items: [
        [
          { label: "Mailing list", href: "https://groups.google.com/g/pypsa" },
          ": announcements about releases and events.",
        ],
        [{ label: "Mastodon", href: siteConfig.social.mastodon }, ": project news."],
        [{ label: "Bluesky", href: siteConfig.social.bluesky }, ": project news."],
        [{ label: "LinkedIn", href: siteConfig.social.linkedin }, ": project news."],
      ],
    },
    {
      id: "docs",
      heading: "Looking for documentation?",
      paragraphs: [
        [
          "Tutorials, examples and the API reference live in the ",
          { label: "PyPSA documentation", href: DOCS_BASE_URL },
          ".",
        ],
      ],
    },
  ],
};
