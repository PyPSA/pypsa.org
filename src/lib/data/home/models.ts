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
  exploreUrl?: string;
  exploreUrlDark?: string;
  institutions?: Institution[];
}

export const modelsSection = {
  eyebrow: "Implementations",
  heading: "PyPSA Models",
  lead: "Open Energy System Models built with PyPSA",
};

export const modelProjects: Project[] = [
  {
    name: "PyPSA-Earth",
    description:
      "A flexible Python-based open optimisation model to study energy system futures around the world",
    image: "/img/projects/pypsa-earth.webp",
    githubUrl: "https://github.com/pypsa-meets-earth/pypsa-earth",
    docsUrl: "https://pypsa-earth.readthedocs.io/en/latest/",
    institutions: [
      {
        name: "PyPSA meets Earth",
        logo: "/img/institutions/pypsa-meets-earth.webp",
        url: "https://pypsa-meets-earth.github.io/",
      },
    ],
  },
  {
    name: "PyPSA-Eur",
    description: "A Sector-Coupled Open Optimisation Model of the European Energy System",
    image: "/img/projects/pypsa-eur.webp",
    githubUrl: "https://github.com/PyPSA/pypsa-eur",
    docsUrl: "https://pypsa-eur.readthedocs.io/",
    exploreUrl: "/explore/europe-light.html",
    exploreUrlDark: "/explore/europe-dark.html",
    institutions: [
      {
        name: "TU Berlin",
        logo: "/img/institutions/tu-berlin.svg",
        url: "https://www.tu.berlin/en/ensys",
      },
    ],
  },
  {
    name: "PyPSA-USA",
    description: "An Open-Source Energy System Optimization Model for the United States",
    image: "/img/projects/pypsa-usa.webp",
    githubUrl: "https://github.com/PyPSA/pypsa-usa",
    docsUrl: "https://pypsa-usa.readthedocs.io/en/latest/",
    institutions: [
      {
        name: "Stanford University",
        logo: "/img/institutions/stanford-university-seeklogo.svg",
        url: "https://ines.stanford.edu/",
      },
    ],
  },
  {
    name: "PyPSA-DE",
    description: "High resolution, sector-coupled model of the German Energy System",
    image: "/img/projects/pypsa-de.webp",
    githubUrl: "https://github.com/PyPSA/pypsa-de",
    institutions: [
      {
        name: "TU Berlin",
        logo: "/img/institutions/tu-berlin.svg",
        url: "https://www.tu.berlin/en/ensys",
      },
    ],
  },
];
