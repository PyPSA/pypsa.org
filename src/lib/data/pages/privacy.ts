import type { PageData } from "./types";

export const privacyPage: PageData = {
  eyebrow: "Legal",
  title: "Privacy & Legal Notice",
  lead: [
    "pypsa.org is the website of the PyPSA open-source community, technically operated by PyPSA Labs gGmbH.",
  ],
  sections: [
    {
      id: "controller",
      heading: "Controller",
      paragraphs: [
        [
          "The controller within the meaning of the GDPR is PyPSA Labs gGmbH, Mertensstr. 16A, 13587 Berlin, Germany. Contact: ",
          { label: "info@pypsa.org", href: "mailto:info@pypsa.org" },
          ".",
        ],
      ],
    },
    {
      id: "legal-notice",
      heading: "Legal notice (§ 5 DDG)",
      items: [
        ["Provider: PyPSA Labs gGmbH, Mertensstr. 16A, 13587 Berlin, Germany"],
        ["Managing directors: Prof. Dr. Tom Brown and Dr.-Ing. Fabian Neumann"],
        ["Register court: Amtsgericht Charlottenburg, HRB 288490 B"],
        ["VAT ID: DE464012030"],
        ["Email: ", { label: "info@pypsa.org", href: "mailto:info@pypsa.org" }],
      ],
    },
    {
      id: "overview",
      heading: "What this site collects",
      paragraphs: [
        [
          "This site does not use analytics, advertising or tracking cookies, and it does not ask you to create an account. We do not run a contact form or newsletter on this site. Pages are static files, so we do not store personal data about your visit ourselves, beyond what the hosting provider and the services below process technically.",
        ],
      ],
    },
    {
      id: "hosting",
      heading: "Hosting",
      paragraphs: [
        [
          "This site is hosted on GitHub Pages, a service of GitHub Inc. (88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). When you open a page, GitHub receives your IP address and the usual request data (browser, time, requested file) and may keep it in server logs. The legal basis is our legitimate interest in delivering the site securely and reliably (Art. 6(1)(f) GDPR). GitHub may transfer data to the USA under the EU-US Data Privacy Framework and standard contractual clauses.",
        ],
      ],
    },
    {
      id: "third-party",
      heading: "Third-party services",
      paragraphs: [
        ["Some features load content from third parties. These providers receive your IP address and request data when the feature loads."],
      ],
      items: [
        [
          "Ask AI widget (Gurubase): the widget sends the questions you type to Gurubase, which uses them to generate an answer. Do not enter personal data into it.",
        ],
        [
          "YouTube videos: embedded through the privacy-enhanced domain youtube-nocookie.com. YouTube (Google) receives data once you load or play a video.",
        ],
        [
          "Interactive map at /explore: loads scripts and styles from bootstrapcdn and jsDelivr, map tiles from CARTO, and map data from Mapbox. These providers receive your IP address and request data.",
        ],
      ],
    },
    {
      id: "github-avatars",
      heading: "GitHub avatars",
      paragraphs: [
        [
          "Contributor pictures on this site are GitHub avatars. They are downloaded once when the site is built and served from this site, so displaying them does not send your IP address or request data to GitHub.",
        ],
      ],
    },
    {
      id: "rights",
      heading: "Your rights",
      paragraphs: [
        [
          "You have the right to access, rectify and erase your personal data, to restrict or object to its processing, and to data portability. Where processing rests on consent, you can withdraw it at any time. To exercise these rights, write to ",
          { label: "info@pypsa.org", href: "mailto:info@pypsa.org" },
          ".",
        ],
      ],
    },
    {
      id: "supervisory-authority",
      heading: "Supervisory authority",
      paragraphs: [
        [
          "You can lodge a complaint with the supervisory authority: Berliner Beauftragte für Datenschutz und Informationsfreiheit, Alt-Moabit 59-61, 10555 Berlin, Germany.",
        ],
      ],
    },
  ],
};
