import { DOCS_BASE_URL } from "../../config";

export const hero = {
  event: {
    label: "Event",
    text: "PyPSA User Meeting on 29 June 2026",
    href: "/events/4th-user-meeting",
  },
  survey: {
    label: "Survey",
    text: "PyPSA User Survey 2026: 10 minutes to shape our roadmap",
    href: "/survey",
  },
  headline: {
    before: "Welcome to the",
    highlight: "PyPSA",
    after: "Community!",
  },
  lead: {
    line1: "PyPSA stands for Python for Power System Analysis.",
    line2: "Free. Open-Source. Batteries included.",
  },
  primaryCta: {
    label: "Get Started",
    href: `${DOCS_BASE_URL}/examples/example-1/`,
  },
  secondaryCta: {
    label: "GitHub Repository",
    href: "https://github.com/PyPSA/PyPSA",
  },
};
