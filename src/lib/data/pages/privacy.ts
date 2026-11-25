import type { PageData } from "./types";
import { surveyMeta } from "$lib/survey/current";
import { lastOpenDay } from "$lib/survey/format";

const email = { label: "contact@pypsa.org", href: "mailto:contact@pypsa.org" };

export const privacyPage: PageData = {
  eyebrow: "Legal",
  title: "Privacy Policy",
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
          email,
          ".",
        ],
      ],
    },
    {
      id: "overview",
      heading: "What this site collects",
      paragraphs: [
        [
          "This site does not use analytics, advertising or tracking cookies, and it does not ask you to create an account. There is no newsletter. The only form is the optional user survey, described below. Pages are static files, so we do not store personal data about your visit ourselves, beyond what the hosting provider and the services below process technically.",
        ],
        [
          "If you switch between light and dark mode, your choice is saved in your browser's local storage. It never leaves your device, and you can remove it by clearing your browser's site data.",
        ],
        [
          "If you start the user survey, your progress is saved in your browser's local storage so you can continue later. If you dismiss the survey banner, that choice is saved there too. Neither is sent to us, and you can remove both by clearing your browser's site data.",
        ],
      ],
    },
    {
      id: "hosting",
      heading: "Hosting",
      paragraphs: [
        [
          "This site is hosted on Cloudflare Workers, a service of Cloudflare, Inc. (101 Townsend St, San Francisco, CA 94107, USA). When you open a page, Cloudflare receives your IP address and the usual request data (browser, time, requested file) to deliver the page and protect the site against attacks. We do not keep access logs ourselves. Cloudflare processes this data on our behalf as a processor under a data processing agreement (Art. 28 GDPR). The legal basis is our legitimate interest in delivering the site securely and reliably (Art. 6(1)(f) GDPR). Cloudflare may transfer data to the USA and is certified under the EU-US Data Privacy Framework.",
        ],
      ],
    },
    {
      id: "user-survey",
      heading: "User survey",
      paragraphs: [
        [
          { strong: "Purpose:" },
          ` the ${surveyMeta.title} helps us prioritise development. Taking part is voluntary, and you can skip any question. The survey is open until ${lastOpenDay(surveyMeta.closes)}.`,
        ],
        [
          { strong: "What is collected:" },
          " your answers, and optionally your organisation and links you choose to share. We do not ask for your name, and we do not store IP addresses with your answers.",
        ],
        [
          { strong: "Where it is stored:" },
          " answers are stored in Cloudflare D1, with EU jurisdiction. Cloudflare processes them on our behalf as a processor.",
        ],
        [{ strong: "Retention:" }, ` ${surveyMeta.retention}`],
        [
          { strong: "Publication:" },
          " we publish results only in aggregate, never individual responses.",
        ],
        [{ strong: "Contact:" }, " ", { label: surveyMeta.contact, href: `mailto:${surveyMeta.contact}` }, "."],
      ],
    },
    {
      id: "email",
      heading: "Email",
      paragraphs: [
        [
          "If you write to us by email, we use your address and message only to answer you. The legal basis is our legitimate interest in replying to your enquiry (Art. 6(1)(f) GDPR). We delete the correspondence once it is no longer needed, unless we are legally required to keep it.",
        ],
      ],
    },
    {
      id: "third-party",
      heading: "Third-party services",
      paragraphs: [
        [
          "Some features load content from third parties. These providers receive your IP address and request data when the feature loads.",
        ],
      ],
      items: [
        [
          "Ask AI widget (Gurubase): the widget is loaded from Gurubase on every page, so Gurubase receives your IP address and request data on each visit. The questions you type are sent to Gurubase to generate an answer, and questions and answers are visible anonymously to the PyPSA team and Gurubase. Do not enter personal data into it.",
        ],
        [
          "YouTube videos: embedded through the privacy-enhanced domain youtube-nocookie.com and only loaded when you play a video. YouTube (Google) then receives your IP address and request data. Video thumbnails are served from this site.",
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
          email,
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
    {
      id: "updated",
      heading: "Last updated",
      paragraphs: [["16 November 2026"]],
    },
  ],
};
