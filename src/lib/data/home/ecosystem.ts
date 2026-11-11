export interface Institution {
  name: string;
  logo: string;
  url: string;
}

/** Image, logo and explore paths are site-relative, components prefix `base`. */
export interface Project {
  name: string;
  description: string;
  image: string;
  githubUrl: string;
  docsUrl?: string;
  websiteUrl?: string;
  institutions?: Institution[];
}

export const ecosystemSection = {
  eyebrow: "Ecosystem",
  heading: "Framework and Tools",
  lead: "PyPSA and its complementary tools and initiatives",
};

export const ecosystemProjects: Project[] = [
  {
    name: "Atlite",
    description:
      "A Lightweight Python Package for Calculating Renewable Power Potentials and Time Series",
    image: "/img/projects/atlite.webp",
    githubUrl: "https://github.com/PyPSA/atlite",
    docsUrl: "https://atlite.readthedocs.io/",
    institutions: [
      {
        name: "TU Berlin",
        logo: "/img/institutions/tu-berlin.svg",
        url: "https://www.tu.berlin/en/ensys",
      },
    ],
  },
  {
    name: "PyPSA",
    description:
      "Python for Power System Analysis - the core framework for simulating and optimising modern power systems",
    image: "/img/projects/pypsa-logo.svg",
    githubUrl: "https://github.com/PyPSA/PyPSA",
    docsUrl: "https://pypsa.readthedocs.io/",
    institutions: [
      {
        name: "TU Berlin",
        logo: "/img/institutions/tu-berlin.svg",
        url: "https://www.tu.berlin/en/ensys",
      },
    ],
  },
  {
    name: "Linopy",
    description: "Linear optimization interface for N-D labeled variables",
    image: "/img/projects/linopy.webp",
    githubUrl: "https://github.com/PyPSA/linopy",
    docsUrl: "https://linopy.readthedocs.io/",
    institutions: [
      {
        name: "OET",
        logo: "/img/institutions/oet.svg",
        url: "https://openenergytransition.org/",
      },
      {
        name: "TU Berlin",
        logo: "/img/institutions/tu-berlin.svg",
        url: "https://www.tu.berlin/en/ensys",
      },
    ],
  },
  {
    name: "Map Your Grid",
    description:
      "Community-driven initiative mapping the world's electrical grids to accelerate the energy transition worldwide",
    image: "/img/projects/mapyourgrid.webp",
    githubUrl: "https://mapyourgrid.org/",
    websiteUrl: "https://mapyourgrid.org/",
    institutions: [
      {
        name: "OET",
        logo: "/img/institutions/oet.svg",
        url: "https://openenergytransition.org/",
      },
    ],
  },
  {
    name: "Powerplantmatching",
    description:
      "A toolset for cleaning, standardizing and combining multiple power plant databases",
    image: "/img/projects/powerplantmatching.webp",
    githubUrl: "https://github.com/PyPSA/powerplantmatching",
    docsUrl: "https://powerplantmatching.readthedocs.io/",
    institutions: [
      {
        name: "TU Berlin",
        logo: "/img/institutions/tu-berlin.svg",
        url: "https://www.tu.berlin/en/ensys",
      },
    ],
  },
  {
    name: "Technology Data",
    description: "Compile assumptions on energy system technologies for various years",
    image: "/img/projects/technology-data.webp",
    githubUrl: "https://github.com/PyPSA/technology-data",
    docsUrl: "https://technology-data.readthedocs.io/en/latest/",
    institutions: [
      {
        name: "OET",
        logo: "/img/institutions/oet.svg",
        url: "https://openenergytransition.org/",
      },
      {
        name: "TU Berlin",
        logo: "/img/institutions/tu-berlin.svg",
        url: "https://www.tu.berlin/en/ensys",
      },
    ],
  },
];
