import { DOCS_BASE_URL } from "../../config";

export type FeatureTabId = "optimization" | "applications" | "analysis" | "performance";

export interface Feature {
  /** Icon key the Features component maps to an icon. */
  icon: string;
  title: string;
  description: string;
  docsUrl?: string;
}

/** `lead` keeps the source line breaks so the rendered HTML stays byte-identical. */
export const featuresSection = {
  eyebrow: "Features",
  heading: "PyPSA Framework",
  lead: "An open-source Python framework for optimising modern power systems with conventional\n    generators, renewable energy, storage, and multi-sector coupling - designed for researchers and\n    planners.",
};

export const featureCategories: Record<FeatureTabId, Feature[]> = {
  optimization: [
    {
      icon: "mdiPowerPlugBattery",
      title: "Economic Dispatch (ED)",
      description:
        "Model short-term market dispatch with unit commitment, renewables, storage, multi-carrier conversion, and more.",
      docsUrl: `${DOCS_BASE_URL}/examples/example-1/`,
    },
    {
      icon: "mdiTransmissionTower",
      title: "Linear Optimal Power Flow (LOPF)",
      description:
        "Optimize power flow in AC-DC networks using linearized KVL/KCL constraints with optional loss approximations.",
      docsUrl: `${DOCS_BASE_URL}/user-guide/linear-power-flow/`,
    },
    {
      icon: "mdiSecurity",
      title: "Security-Constrained LOPF (SCLOPF)",
      description:
        "Ensure system reliability by accounting for line outage contingencies under N-1 conditions.",
      docsUrl: `${DOCS_BASE_URL}/examples/scigrid-sclopf/`,
    },
    {
      icon: "mdiCrane",
      title: "Capacity Expansion Planning (CEP)",
      description:
        "Plan long-term infrastructure investments for generation, storage, transmission, and conversion with continuous or discrete options.",
      docsUrl: `${DOCS_BASE_URL}/examples/capacity-expansion-planning-single-node/`,
    },
    {
      icon: "mdiRoad",
      title: "Pathway Planning",
      description:
        "Co-optimize multi-period investments to design energy transition pathways with perfect foresight planning.",
      docsUrl: `${DOCS_BASE_URL}/user-guide/optimization/pathway-planning/`,
    },
    {
      icon: "mdiRollerblade",
      title: "Rolling-Horizon Optimisation",
      description:
        "Solve large-scale problems sequentially with myopic foresight and dynamic updates across time horizons.",
      docsUrl: `${DOCS_BASE_URL}/examples/rolling-horizon/`,
    },
    {
      icon: "mdiCrosshairsQuestion",
      title: "Stochastic Optimisation",
      description:
        "Two-stage stochastic programming for uncertainty handling with weighted scenarios and separate investment-dispatch decisions.",
      docsUrl: `${DOCS_BASE_URL}/user-guide/optimization/stochastic/`,
    },
    {
      icon: "mdiDiversify",
      title: "Modelling-to-Generate-Alternatives (MGA)",
      description:
        "Explore alternative system designs with similar costs to understand trade-offs and decision flexibility.",
      docsUrl: `${DOCS_BASE_URL}/user-guide/optimization/modelling-to-generate-alternatives/`,
    },
    {
      icon: "mdiBuildingColumns",
      title: "Policy Constraints",
      description:
        "Built-in support for CO₂ limits, subsidies, resource limits, expansion limits, and growth constraints.",
      docsUrl: `${DOCS_BASE_URL}/user-guide/optimization/global-constraints/`,
    },
    {
      icon: "mdiScrewdriver",
      title: "Custom Constraints",
      description:
        "Impose custom objectives, variables and constraints using Linopy for specialized requirements.",
      docsUrl: `${DOCS_BASE_URL}/user-guide/optimization/custom-constraints/`,
    },
    {
      icon: "mdiDotsSquare",
      title: "Solver Flexibility",
      description:
        "Support for wide range of LP, MILP, and QP solvers from open-source to commercial solutions.",
      docsUrl: `${DOCS_BASE_URL}/home/installation/#solvers`,
    },
  ],
  applications: [
    {
      icon: "mdiHeatPump",
      title: "Sector-Coupling",
      description:
        "Model integrated multi-carrier energy systems with heat pumps, electrolysers, EVs, and synthetic fuels.",
      docsUrl: `${DOCS_BASE_URL}/examples/sector-coupling-single-node/`,
    },
    {
      icon: "mdiTransmissionTowerApp",
      title: "Standard Grid Components",
      description:
        "Includes standard types for lines and transformers from pandapower for realistic grid modeling.",
      docsUrl: `${DOCS_BASE_URL}/user-guide/design/#network-components`,
    },
    {
      icon: "simpleGraphql",
      title: "Static Power Flow Analysis",
      description:
        "Compute non-linear and linearised load flows for AC-DC grids using Newton-Raphson method.",
      docsUrl: `${DOCS_BASE_URL}/examples/minimal-example-pf/?h=power+flow`,
    },
    {
      icon: "mdiLightbulb",
      title: "Diverse Applications",
      description:
        "Support strategic energy analyses from technology assessment to decarbonisation pathway planning.",
      docsUrl: `${DOCS_BASE_URL}/examples/examples/`,
    },
  ],
  performance: [
    {
      icon: "mdiViewModule",
      title: "Modular Design",
      description:
        "Clean separation between data and modeling code enables flexible scenario development.",
    },
    {
      icon: "mdiCarCruiseControl",
      title: "Resolution Control",
      description:
        "Flexible control over temporal, spatial, and sectoral scope and detail for any analysis needs.",
    },
    {
      icon: "mdiGridLarge",
      title: "Spatial Clustering",
      description:
        "Reduce model size for large networks via spatial aggregation strategies and network simplification.",
      docsUrl: `${DOCS_BASE_URL}/user-guide/clustering/`,
    },
    {
      icon: "mdiDataMatrix",
      title: "Data Backbone",
      description:
        "Uses pandas for data handling and linopy for optimization with efficient solver interfacing.",
    },
    {
      icon: "mdiRunFast",
      title: "Performance",
      description:
        "Designed to scale with high-resolution networks, minimizing memory usage and solver overhead.",
      docsUrl: "https://linopy.readthedocs.io/en/latest/benchmark.html",
    },
    {
      icon: "trendingUpArrow",
      title: "Scalability",
      description:
        "Handle models from small prototypes to continent-scale systems on high-performance clusters.",
    },
  ],
  analysis: [
    {
      icon: "simpleShadow",
      title: "Shadow Prices",
      description:
        "Output dual values including nodal prices, storage values, scarcity and CO₂ pricing.",
    },
    {
      icon: "simpleGoogleSheets",
      title: "Statistics",
      description:
        "Built-in tools for energy balances, capacities, costs, market values, and component revenues.",
      docsUrl: `${DOCS_BASE_URL}/user-guide/statistics/`,
    },
    {
      icon: "octiconsPaintbrush",
      title: "Visualisations",
      description:
        "Plot statistics, time series, spatial distributions of line loadings and dispatch decisions.",
      docsUrl: `${DOCS_BASE_URL}/user-guide/plotting/charts/`,
    },
    {
      icon: "mdiNotebook",
      title: "Documentation",
      description:
        "Comprehensive user guide, API reference, and plenty of examples are available.",
    },
    {
      icon: "peopleGroup",
      title: "Community Support",
      description:
        "Active community on GitHub and Discord for user support and development discussions.",
      docsUrl: `${DOCS_BASE_URL}/user-guide/support/`,
    },
    {
      icon: "mdiLockOpen",
      title: "MIT License",
      description:
        "Fully open-source and free for commercial and academic use with no restrictions.",
      docsUrl: `${DOCS_BASE_URL}/home/license/`,
    },
  ],
};

export const featureTabs: { id: FeatureTabId; label: string; count: number }[] = [
  { id: "optimization", label: "Optimization", count: featureCategories.optimization.length },
  { id: "applications", label: "Applications", count: featureCategories.applications.length },
  { id: "analysis", label: "Analysis", count: featureCategories.analysis.length },
  { id: "performance", label: "Performance", count: featureCategories.performance.length },
];
