import type { PageData } from "./types";

export const legalPage: PageData = {
  eyebrow: "Legal",
  title: "Legal Notice",
  lead: ["Information pursuant to § 5 DDG (German Digital Services Act)."],
  sections: [
    {
      id: "provider",
      heading: "Provider",
      paragraphs: [["PyPSA Labs gGmbH"], ["Mertensstr. 16A"], ["13587 Berlin"], ["Germany"]],
    },
    {
      id: "representatives",
      heading: "Represented by the managing directors",
      paragraphs: [["Prof. Dr. Tom Brown"], ["Dr.-Ing. Fabian Neumann"]],
    },
    {
      id: "contact",
      heading: "Contact",
      paragraphs: [["Email: ", { label: "contact@pypsa.org", href: "mailto:contact@pypsa.org" }]],
    },
    {
      id: "register",
      heading: "Register entry",
      paragraphs: [
        ["Registry court: Amtsgericht Charlottenburg"],
        ["Registration number: HRB 288490 B"],
      ],
    },
    {
      id: "vat",
      heading: "VAT identification number",
      paragraphs: [
        ["VAT ID pursuant to § 27 a UStG: DE464012030"],
        ["Business identification number pursuant to § 139 c AO: DE464012030"],
      ],
    },
  ],
};
