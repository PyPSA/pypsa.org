import { siteConfig } from "$lib/config/meta";
import type { PageData } from "./types";

export const contactPage: PageData = {
  eyebrow: "Community",
  title: "Contact",
  lead: ["Please consider the following ways to reach out to the community and the developers."],
  sections: [
    {
      id: "support",
      heading: "Support",
      items: [
        [
          "To discuss with other PyPSA users, organise projects, share news, and get in touch with the community you can use the ",
          { label: "Discord server", href: siteConfig.social.discord },
          ".",
        ],
        [
          "For bugs and feature requests, please use the ",
          { label: "issue tracker", href: "https://github.com/PyPSA/PyPSA/issues" },
          ".",
        ],
        [
          "We strongly welcome anyone interested in contributing to the project. If you have ideas or suggestions, feel invited to file issues or make pull requests on ",
          { label: "GitHub", href: "https://github.com/PyPSA" },
          ".",
        ],
      ],
    },
    {
      id: "news",
      heading: "News",
      paragraphs: [
        [
          "Releases and events are announced on ",
          { label: "Mastodon", href: siteConfig.social.mastodon },
          ", ",
          { label: "Bluesky", href: siteConfig.social.bluesky },
          " and ",
          { label: "LinkedIn", href: siteConfig.social.linkedin },
          ".",
        ],
      ],
    },
    {
      id: "email",
      heading: "Email",
      paragraphs: [
        [
          "For anything else, you can reach us at ",
          { label: "contact@pypsa.org", href: "mailto:contact@pypsa.org" },
          ".",
        ],
      ],
    },
  ],
};
