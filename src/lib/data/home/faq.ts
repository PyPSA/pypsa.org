import { DOCS_BASE_URL } from "../../config";

export interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

export const FAQList: FAQProps[] = [
  {
    question: "What is the difference between PyPSA and PyPSA-X?",
    answer:
      '<a href="https://github.com/PyPSA/pypsa" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">PyPSA</a> is a framework for optimising and simulating modern power and energy systems. It is a toolbox that does not hold any data. Specific model implementations such as <a href="https://github.com/pypsa-meets-earth/pypsa-earth" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">PyPSA-Earth</a>, <a href="https://github.com/PyPSA/pypsa-eur" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">PyPSA-Eur</a> and <a href="https://github.com/PyPSA/pypsa-usa" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">PyPSA-USA</a> integrate datasets, processing and workflow management.',
    value: "item-1",
  },
  {
    question: "Is using PyPSA for free?",
    answer:
      'PyPSA is licensed under the <a href="https://opensource.org/license/mit" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">MIT open-source licence</a>, which makes it fully open-source and free for both commercial and academic use. Similar licences are used for other listed projects.',
    value: "item-2",
  },
  {
    question: "Where can I find learning materials?",
    answer: `PyPSA offers comprehensive learning resources in the <a href="${DOCS_BASE_URL}" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">documentation</a> including tutorials and examples. You can also find a list of video lectures, workshops, and training materials for PyPSA and Energy Systems Modelling in general on the dedicated <a href="${DOCS_BASE_URL}/user-guide/learning-materials/" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">learning materials</a> page. Additionally, the YouTube channels of <a href="https://www.youtube.com/@pypsa-official" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">PyPSA</a> and <a href="https://www.youtube.com/@pypsameetsearth7475" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">PyPSA meets Earth</a> offer video tutorials and collect community videos in their playlist sections.`,
    value: "item-3",
  },
  {
    question: "Do I need to buy a commercial solver?",
    answer:
      'No, you can use open-source solvers such as <a href="https://highs.dev/" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">HiGHS</a>. But it helps for very large problems with high spatial and temporal resolution, cross-sectoral scope, and multiple investment periods. <a href="https://www.gurobi.com/solutions/gurobi-optimizer/" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">Gurobi</a> and <a href="https://www.ibm.com/products/ilog-cplex-optimization-studio/cplex-optimizer" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">CPLEX</a> are recommended for better performance or allow finding any solutions at all.',
    value: "item-4",
  },
  {
    question: "Can I get support for using PyPSA?",
    answer:
      'PyPSA has an active community of users and developers on Discord and elsewhere who can help you with questions and issues. Also, various consultancies offer paid support, such as <a href="https://www.openenergytransition.org" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">OET</a>, <a href="https://www.d-fine.com/en/" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">d-fine</a>, <a href="https://energynautics.com/en/" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">Energynautics</a>, and <a href="https://www.climact.com/" target="_blank" rel="noreferrer" class="underline underline-offset-2" style="color: var(--brand-blue-text);">CLIMACT</a>.',
    value: "item-5",
  },
];

export const faqSection = {
  eyebrow: "FAQ",
  heading: "Frequently Asked Questions",
  moreLabel: "Still have questions? Check out the full",
  moreLinkLabel: "FAQ",
  moreLinkHref: `${DOCS_BASE_URL}/user-guide/faq`,
};
