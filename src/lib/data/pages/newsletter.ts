import type { PageData } from "./types";

export const newsletterPage: PageData = {
  eyebrow: "Community",
  title: "Newsletter",
  lead: ["News from the PyPSA community, straight to your inbox."],
  sections: [
    {
      id: "about",
      heading: "What you get",
      paragraphs: [
        [
          "Occasional emails about new PyPSA releases, upcoming events and community news. We use double opt-in: after you sign up, we send a link to confirm your address. You can unsubscribe at any time with the link in every email. See the ",
          { label: "privacy policy", href: "/privacy" },
          " for details.",
        ],
      ],
    },
  ],
};

export const newsletterConfirmedPage: PageData = {
  eyebrow: "Newsletter",
  title: "You're subscribed",
  lead: ["Thank you, your subscription is confirmed."],
  sections: [
    {
      id: "next",
      heading: "What next",
      items: [
        [{ label: "Back to the home page", href: "/" }],
        [{ label: "Browse upcoming events", href: "/events" }],
      ],
    },
  ],
};
