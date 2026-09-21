// Hand-curated roadmap data. Unlike contributors.ts / references.ts this file
// is NOT generated — edit it directly.
//
// An item is considered "shipped" when it has a `date` (and usually a
// `version`); those render a date + version label. Items without a `date` are
// upcoming/planned and render no date.
//
// NOTE: the planned (no-date) entries below are PLACEHOLDERS. Maintainers
// should replace their titles, descriptions, and links with real roadmap
// items. The shipped entries are curated from the upstream release notes.

export interface RoadmapItem {
  id: string; // stable slug, used as {#each} key
  title: string;
  description: string;
  icon?: string; // optional @mdi/js path name (rendered via MdiIcon)
  date?: string; // ISO "YYYY-MM-DD" — present only for shipped items
  version?: string; // e.g. "v0.31" — present only for shipped items
  link?: string; // optional GitHub issue/PR/discussion/release URL
}

export const roadmapData: RoadmapItem[] = [
  // --- PLANNED ITEMS (no date) — shown first. ---

  {
    id: "strict-validation",
    title: "Stricter network validation",
    description: "Catch inconsistent inputs for better and earlier user feedback.",
    icon: "mdiCheckDecagramOutline",
  },
  {
    id: "improved-io",
    title: "New file format",
    description:
      "A new network format, faster than today's netCDF, that loads data lazily, reads only what is needed and supports streaming.",
    icon: "mdiTrayArrowDown",
  },
  {
    id: "constraint-matrix-scaling",
    title: "Improved model scaling",
    description:
      "Automatic scaling to improve the model's numerical conditioning, solver stability and speed.",
    icon: "mdiGrid",
  },
  {
    id: "custom-constraints-interface",
    title: "Custom constraint interface",
    description: "Define constraints and models in a text-based format, without the need for scripting.",
    icon: "mdiPlaylistEdit",
  },
  {
    id: "atomic-io",
    title: "Roundtrip Serialisation IO",
    description:
      "Any network object can be saved and loaded back identically, with no state lost, including custom constraints, solver metadata and geospatial data.",
    icon: "mdiContentSaveCheckOutline",
  },
  {
    id: "flow-based-market-coupling",
    title: "Flow-based market coupling",
    description:
      "Model zonal electricity markets with flow-based domains, as used in European market coupling.",
    icon: "mdiTransitConnectionHorizontal",
  },
  {
    id: "recourse-investments",
    title: "Recourse investments",
    description:
      "Allow certain investment variables to adjust per scenario as better information about uncertain conditions becomes available, extending recourse beyond dispatch decisions.",
    icon: "mdiSourceFork",
  },
  {
    id: "endogenous-learning",
    title: "Endogenous learning curves",
    description:
      "Technological learning modelled endogenously via piecewise-linear constraints, so costs fall with deployment.",
    icon: "mdiTrendingDown",
  },
  {
    id: "properties",
    title: "Categorised components",
    description:
      "Separate physical components (e.g. generators, lines) from shared properties (e.g. carriers) and allow custom-defined properties.",
    icon: "mdiTagOutline",
  },
  {
    id: "unit-commitment-overhaul",
    title: "Unit commitment extensions and speed-up",
    description:
      "An extended and more performant unit commitment formulation considering a wider set of operational constraints.",
    icon: "mdiEngineOutline",
  },
  {
    id: "non-uniform-time-resolution",
    title: "Non-uniform time resolution",
    description:
      "Mix different snapshot resolutions per bus or carrier within a single model to save computation time.",
    icon: "mdiTimelineClockOutline",
  },
  {
    id: "gsa-module",
    title: "Global sensitivity analysis",
    description: "A new module for uncertainty quantification and global sensitivity analysis.",
    icon: "mdiChartScatterPlot",
  },
  {
    id: "pypsa-dashboard",
    title: "Interactive dashboard",
    description:
      "Launch a local dashboard straight from PyPSA, powered by the PyPSA App, to explore, visualise and analyse networks with statistics, plots and interactive maps.",
    icon: "mdiViewDashboardOutline",
  },

  // --- SHIPPED MILESTONES ---
  //
  // Curated from the upstream release notes (big features and project
  // milestones only, no bugfix/compat noise). Each feature is a separate
  // entry, even when several shipped in the same release — they share the
  // same version, date, and release link. Order here is oldest→newest for
  // readability; the page sorts shipped by date descending at render time,
  // so file order is cosmetic.

  {
    id: "pypsa-first-commit",
    title: "First commit",
    description: "The first commit of Python for Power System Analysis.",
    icon: "mdiFlagOutline",
    date: "2015-10-12",
    link: "https://github.com/PyPSA/PyPSA",
  },

  // v0.3.0
  {
    id: "power-flow",
    title: "Power flow engine",
    description:
      "Full non-linear Newton-Raphson AC power flow and fast linear power flow over the network — the analysis core PyPSA is named for.",
    icon: "mdiCurrentAc",
    date: "2016-01-27",
    version: "v0.3.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.3.0",
  },

  // v0.5.0
  {
    id: "link-component",
    title: "Link component",
    description:
      "New controllable directed Link component — the primitive behind power-to-X and sector coupling.",
    icon: "mdiSwapHorizontal",
    date: "2016-07-21",
    version: "v0.5.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.5.0",
  },
  {
    id: "multi-energy-carriers",
    title: "Multi-energy carriers",
    description:
      "Generic bus carrier attribute (heat, gas, …) replacing AC/DC-only buses, enabling multi-energy networks.",
    icon: "mdiVectorLine",
    date: "2016-07-21",
    version: "v0.5.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.5.0",
  },
  {
    id: "sclopf",
    title: "Security-constrained LOPF",
    description:
      "N-1 security-constrained optimisation keeping the network feasible under single-element outages.",
    icon: "mdiShieldCheckOutline",
    date: "2016-07-21",
    version: "v0.5.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.5.0",
  },

  // v0.6.0
  {
    id: "store-component",
    title: "Store component",
    description:
      "New fundamental Store component for energy storage, inheriting the carrier of its bus.",
    icon: "mdiBatteryChargingOutline",
    date: "2016-08-23",
    version: "v0.6.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.6.0",
  },
  {
    id: "sector-coupling-models",
    title: "Sector-coupling models",
    description:
      "Link-based models for CHP, heat pumps, resistive power-to-heat, power-to-gas and battery electric vehicles.",
    icon: "mdiTransitConnectionVariant",
    date: "2016-08-23",
    version: "v0.6.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.6.0",
  },

  // v0.7.0
  {
    id: "time-varying-attributes",
    title: "Time-varying attributes",
    description:
      "Any component attribute can be static or vary per snapshot, storing only the columns that change — the time-series foundation for the whole framework.",
    icon: "mdiWaveform",
    date: "2016-11-20",
    version: "v0.7.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.7.0",
  },

  // v0.8.0
  {
    id: "standard-component-types",
    title: "Standard line & transformer types",
    description:
      "Built-in pandapower-based standard types — set a type and length instead of computing electrical parameters by hand.",
    icon: "mdiTransmissionTower",
    date: "2017-01-25",
    version: "v0.8.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.8.0",
  },
  {
    id: "transformer-model",
    title: "Overhauled transformer model",
    description:
      "More accurate T-model equivalent circuit with discrete tap steps and consistent phase-shift handling.",
    icon: "mdiFlashOutline",
    date: "2017-01-25",
    version: "v0.8.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.8.0",
  },

  // v0.9.0
  {
    id: "unit-commitment",
    title: "Unit commitment (MILP)",
    description:
      "MILP unit commitment for generators: binary online status, minimum part loads, min up/down times, start-up and shut-down costs.",
    icon: "mdiPowerPlugOutline",
    date: "2017-04-29",
    version: "v0.9.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.9.0",
  },
  {
    id: "ramp-limits",
    title: "Generator ramp limits",
    description: "Ramp-up and ramp-down rate limits implemented for all generators.",
    icon: "mdiTrendingUp",
    date: "2017-04-29",
    version: "v0.9.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.9.0",
  },
  {
    id: "cycle-flow-lopf",
    title: "Faster cycle-flow LOPF",
    description:
      "Mathematically-equivalent cycle-flow LOPF formulations solving up to 20× faster than the angle-based formulation.",
    icon: "mdiSpeedometer",
    date: "2017-04-29",
    version: "v0.9.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.9.0",
  },

  // v0.10.0
  {
    id: "global-constraints",
    title: "Global constraints (CO₂ limits)",
    description:
      "New GlobalConstraint component for system-wide limits such as CO₂ emissions.",
    icon: "mdiMoleculeCo2",
    date: "2017-08-07",
    version: "v0.10.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.10.0",
  },

  // v0.11.0
  {
    id: "madd",
    title: "Bulk component creation",
    description:
      "New `n.madd()` adds many components at once, far faster than repeated `n.add()` calls.",
    icon: "mdiPlusBoxMultipleOutline",
    date: "2017-10-21",
    version: "v0.11.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.11.0",
  },
  {
    id: "hdf5-io",
    title: "HDF5 network I/O",
    description:
      "Export and import whole networks as single HDF5 files via `n.export_to_hdf5()` / `n.import_from_hdf5()`.",
    icon: "mdiDatabaseOutline",
    date: "2017-10-21",
    version: "v0.11.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.11.0",
  },

  // v0.12.0
  {
    id: "dynamic-line-rating",
    title: "Line flow limits (s_max_pu)",
    description:
      "New `s_max_pu` caps passive-branch flow as a share of rating — usable as an n-1 contingency factor or time-varying dynamic line rating.",
    icon: "mdiThermometerLines",
    date: "2017-11-30",
    version: "v0.12.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.12.0",
  },

  // v0.13.0
  {
    id: "multi-output-links",
    title: "Multi-output links",
    description:
      "Links with multiple outputs at fixed ratios, e.g. CHP units producing both power and heat.",
    icon: "mdiSourceBranch",
    date: "2018-01-25",
    version: "v0.13.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.13.0",
  },
  {
    id: "netcdf-io",
    title: "NetCDF network files",
    description: "Faster, compact single-file NetCDF network storage.",
    icon: "mdiFileDocumentOutline",
    date: "2018-01-25",
    version: "v0.13.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.13.0",
  },

  // v0.16.0
  {
    id: "nomopyomo",
    title: "Pyomo-free optimisation",
    description:
      "In-house LOPF framework (`pyomo=False`) cutting memory use and solve time for large networks.",
    icon: "mdiLightningBoltOutline",
    date: "2019-12-20",
    version: "v0.16.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.16.0",
  },
  {
    id: "distributed-slack",
    title: "Distributed slack power flow",
    description:
      "Non-linear power flow can spread the slack across many generators by dispatch or custom weights instead of a single slack bus.",
    icon: "mdiCallSplit",
    date: "2019-12-20",
    version: "v0.16.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.16.0",
  },

  // v0.17.0
  {
    id: "custom-objectives",
    title: "Custom objective functions",
    description:
      "Pyomo-free LOPF gains custom objective terms via `extra_functionality` and parsed shadow prices.",
    icon: "mdiFunctionVariant",
    date: "2020-03-23",
    version: "v0.17.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.17.0",
  },
  {
    id: "cplex-support",
    title: "CPLEX solver support",
    description: "CPLEX added as an optimisation solver option.",
    icon: "mdiCalculatorVariantOutline",
    date: "2020-03-23",
    version: "v0.17.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.17.0",
  },

  // v0.18.0
  {
    id: "multi-period",
    title: "Multi-period pathway optimisation",
    description: "Investment optimisation across multiple periods/decades.",
    icon: "mdiCalendarClock",
    date: "2021-08-12",
    version: "v0.18.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.18.0",
  },
  {
    id: "mit-license",
    title: "Relicensed to MIT",
    description: "PyPSA relicensed from GPLv3 to the permissive MIT license.",
    icon: "mdiScaleBalance",
    date: "2021-08-12",
    version: "v0.18.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.18.0",
  },

  // v0.19.0
  {
    id: "highs-solver",
    title: "Open-source HiGHS solver",
    description: "Interface to the open-source HiGHS solver.",
    icon: "mdiChip",
    date: "2022-02-11",
    version: "v0.19.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.19.0",
  },
  {
    id: "link-ramp-limits",
    title: "Ramp limits for links",
    description: "Ramp-rate limits extended to Link components.",
    icon: "mdiSpeedometerMedium",
    date: "2022-02-11",
    version: "v0.19.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.19.0",
  },
  {
    id: "hac-clustering",
    title: "Hierarchical network clustering",
    description: "Hierarchical agglomerative clustering (HAC) for spatial network aggregation.",
    icon: "mdiHexagonMultipleOutline",
    date: "2022-02-11",
    version: "v0.19.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.19.0",
  },

  // v0.21.0
  {
    id: "linopy",
    title: "Linopy optimisation backend",
    description:
      "New `n.optimize()` built on Linopy — faster model build and a cleaner extra-functionality API.",
    icon: "mdiSigma",
    date: "2022-11-07",
    version: "v0.21.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.21.0",
  },
  {
    id: "statistics-module",
    title: "Statistics module",
    description:
      "New `n.statistics` module for system metrics like capex, opex, capacity and curtailment.",
    icon: "mdiChartBarStacked",
    date: "2022-11-07",
    version: "v0.21.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.21.0",
  },

  // v0.23.0
  {
    id: "transmission-losses",
    title: "Transmission losses",
    description: "Piecewise-linear approximation of transmission losses in the LOPF.",
    icon: "mdiSineWave",
    date: "2023-05-10",
    version: "v0.23.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.23.0",
  },
  {
    id: "linearised-uc",
    title: "Linearised unit commitment",
    description: "Linear relaxation of unit commitment for faster large-scale solves.",
    icon: "mdiChartTimelineVariant",
    date: "2023-05-10",
    version: "v0.23.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.23.0",
  },
  {
    id: "time-varying-efficiency",
    title: "Time-varying efficiencies",
    description: "Component efficiencies can now vary over snapshots.",
    icon: "mdiClockOutline",
    date: "2023-05-10",
    version: "v0.23.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.23.0",
  },

  // v0.24.0
  {
    id: "quadratic-costs",
    title: "Quadratic marginal costs",
    description:
      "Quadratic marginal cost terms for generators, links, stores and storage units (needs a QP-capable solver).",
    icon: "mdiChartBellCurve",
    date: "2023-06-27",
    version: "v0.24.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.24.0",
  },
  {
    id: "energy-balance-statistics",
    title: "Energy-balance statistics",
    description:
      "Statistics module gains energy balances, dispatch, time series and market values per bus.",
    icon: "mdiChartAreaspline",
    date: "2023-06-27",
    version: "v0.24.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.24.0",
  },
  {
    id: "lopf-deprecation",
    title: "n.optimize() replaces n.lopf()",
    description:
      "The legacy `n.lopf()` is deprecated in favour of the Linopy-based `n.optimize()`, with a migration guide.",
    icon: "mdiSwapHorizontalBold",
    date: "2023-06-27",
    version: "v0.24.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.24.0",
  },

  // v0.25.0
  {
    id: "rolling-horizon",
    title: "Rolling-horizon optimisation",
    description: "Solve long time series in sequential overlapping windows.",
    icon: "mdiClockFast",
    date: "2023-07-13",
    version: "v0.25.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.25.0",
  },
  {
    id: "mga",
    title: "Modelling to generate alternatives",
    description: "MGA explores near-optimal solution spaces beyond the single least-cost result.",
    icon: "mdiVectorTriangle",
    date: "2023-07-13",
    version: "v0.25.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.25.0",
  },
  {
    id: "cluster-accessor",
    title: "Spatial clustering accessor",
    description:
      "Refactored clustering exposed on the network via `n.cluster.*` with consistent strategies and better performance.",
    icon: "mdiVectorCombine",
    date: "2023-07-13",
    version: "v0.25.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.25.0",
  },

  // v0.26.0
  {
    id: "shapes-component",
    title: "Geographic shapes component",
    description: "New `n.shapes` component to attach geographic geometries to a network.",
    icon: "mdiVectorPolygon",
    date: "2023-12-04",
    version: "v0.26.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.26.0",
  },
  {
    id: "modular-capacities",
    title: "Modular capacity expansion",
    description: "Discrete, modular (block-size) capacity expansion for components.",
    icon: "mdiViewGridOutline",
    date: "2023-12-04",
    version: "v0.26.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.26.0",
  },

  // v0.28.0
  {
    id: "network-merge",
    title: "Network merging",
    description:
      "New `n.merge()` (also `n + m`) combines the components and time series of two networks into one.",
    icon: "mdiSetMerge",
    date: "2024-05-08",
    version: "v0.28.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.28.0",
  },

  // v0.29.0
  {
    id: "highs-default",
    title: "HiGHS becomes default solver",
    description: "The open-source HiGHS solver is now PyPSA's default.",
    icon: "mdiCogOutline",
    date: "2024-07-31",
    version: "v0.29.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.29.0",
  },
  {
    id: "lopf-removed",
    title: "Legacy LOPF removed",
    description: "The old Pyomo and nomopyomo LOPF implementations were removed.",
    icon: "mdiDeleteOutline",
    date: "2024-07-31",
    version: "v0.29.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.29.0",
  },

  // v0.30.0
  {
    id: "interactive-maps",
    title: "Interactive map exploration",
    description: "`n.explore()` opens interactive folium/geopandas network maps.",
    icon: "mdiMapSearchOutline",
    date: "2024-08-30",
    version: "v0.30.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.30.0",
  },

  // v0.31.0
  {
    id: "active-flag",
    title: "Active component flag",
    description:
      "New `active` attribute toggles assets in or out of optimisation, power flow and statistics as a global filter.",
    icon: "mdiToggleSwitchOutline",
    date: "2024-10-01",
    version: "v0.31.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.31.0",
  },

  // v0.32.0
  {
    id: "optimization-expressions",
    title: "Optimisation expressions",
    description:
      "New `n.optimize.expressions` module builds constraint expressions with the same grouping and filtering as the statistics module.",
    icon: "mdiFunction",
    date: "2024-12-05",
    version: "v0.32.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.32.0",
  },

  // v0.33.0
  {
    id: "global-options",
    title: "Global options",
    description:
      "Pandas style options to allow configuring PyPSA globally.",
    icon: "mdiTune",
    date: "2025-02-07",
    version: "v0.33.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.33.0",
  },
  {
    id: "component-class",
    title: "Component class refactor",
    description:
      "New component class layer moving component data off the Network object, easing future features.",
    icon: "mdiShapeOutline",
    date: "2025-02-07",
    version: "v0.33.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.33.0",
  },
  // v0.34.0
  {
    id: "excel-io",
    title: "Excel import/export",
    description: "Read and write whole networks as Excel workbooks.",
    icon: "mdiFileExcelOutline",
    date: "2025-03-25",
    version: "v0.34.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.34.0",
  },
  {
    id: "statistics-plotting",
    title: "Statistics plotting API",
    description: "A plotting API on every statistic out of the box.",
    icon: "mdiChartBar",
    date: "2025-03-25",
    version: "v0.34.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.34.0",
  },

  // v0.35.0
  {
    id: "interactive-statistics",
    title: "Interactive statistics plots",
    description: "Interactive equivalent of every statistics plot via plotly.",
    icon: "mdiChartMultiple",
    date: "2025-06-22",
    version: "v0.35.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.35.0",
  },
  {
    id: "network-collection",
    title: "NetworkCollection container",
    description:
      "Experimental `NetworkCollection` holds many Network objects in one container for comparison.",
    icon: "mdiFolderMultipleOutline",
    date: "2025-06-22",
    version: "v0.35.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v0.35.0",
  },

  // v1.0.0
  {
    id: "pypsa-1",
    title: "PyPSA 1.0 🎉",
    description: "PyPSA finally goes officially stable.",
    icon: "mdiTrophyOutline",
    date: "2025-10-14",
    version: "v1.0.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.0.0",
  },
  {
    id: "stable-release",
    title: "Stable release",
    description:
      "PyPSA is now stable. Upgrades within 1.x won't break your code, and breaking changes wait for the next major version with deprecation warnings first.",
    icon: "mdiTagCheckOutline",
    date: "2025-10-14",
    version: "v1.0.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.0.0",
  },
  {
    id: "stochastic-optimisation",
    title: "Stochastic optimisation",
    description: "Two-stage stochastic optimisation across weighted scenarios.",
    icon: "mdiDiceMultipleOutline",
    date: "2025-10-14",
    version: "v1.0.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.0.0",
  },
  {
    id: "pydeck-maps",
    title: "Interactive maps",
    description:
      "`n.explore()` now returns PyDeck maps supporting all static-plot options, exportable to self-contained HTML.",
    icon: "mdiMapOutline",
    date: "2025-10-14",
    version: "v1.0.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.0.0",
  },
  {
    id: "xarray-core",
    title: "xarray optimisation core",
    description:
      "Optimisation model rebuilt on an xarray view that spans all dimensions at once, enabling cleaner problem formulation.",
    icon: "mdiCubeOutline",
    date: "2025-10-14",
    version: "v1.0.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.0.0",
  },
  {
    id: "directional-mga",
    title: "Directional MGA",
    description:
      "Solve modelling-to-generate-alternatives along chosen directions in user-defined coordinate space, with a parallelised multi-direction sweep.",
    icon: "mdiArrowDecisionOutline",
    date: "2025-10-14",
    version: "v1.0.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.0.0",
  },
  {
    id: "cvar",
    title: "CVaR risk-averse mode",
    description: "Conditional Value-at-Risk objective for risk-averse optimisation.",
    icon: "mdiShieldAlertOutline",
    date: "2025-10-14",
    version: "v1.0.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.0.0",
  },

  // v1.0.7
  {
    id: "overnight-fom-cost",
    title: "Overnight & FOM cost split",
    description:
      "Specify overnight investment cost and fixed O&M separately and let PyPSA annuitise them at solve time, with dedicated cost statistics for reporting.",
    icon: "mdiCashMultiple",
    date: "2026-01-13",
    version: "v1.0.7",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.0.7",
  },

  // v1.1.0
  {
    id: "temporal-clustering",
    title: "Temporal clustering",
    description:
      "New `n.cluster.temporal.*` accessor to aggregate snapshots into representative periods.",
    icon: "mdiCalendarMultiselect",
    date: "2026-02-17",
    version: "v1.1.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.1.0",
  },
  {
    id: "committable-extendable",
    title: "Committable + extendable assets",
    description: "Components can now be committable and capacity-extendable at the same time.",
    icon: "mdiCogSyncOutline",
    date: "2026-02-17",
    version: "v1.1.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.1.0",
  },
  {
    id: "secant-losses",
    title: "Secant transmission losses",
    description:
      "New secant-based approximation of transmission losses with configurable tolerances, alongside the existing tangent method.",
    icon: "mdiVectorCurve",
    date: "2026-02-17",
    version: "v1.1.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.1.0",
  },

  // v1.2.0
  {
    id: "process-component",
    title: "Process component",
    description: "New multi-port Process component with explicit conversion rates.",
    icon: "mdiCogTransferOutline",
    date: "2026-04-21",
    version: "v1.2.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.2.0",
  },
  {
    id: "link-delays",
    title: "Link & process time-delays",
    description: "Weighted time-delays for Link and Process component outputs.",
    icon: "mdiTimerOutline",
    date: "2026-04-21",
    version: "v1.2.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.2.0",
  },

  // v1.3.0
  {
    id: "piecewise",
    title: "Piecewise-linear relationships",
    description: "Piecewise-linear investment costs, marginal costs and efficiencies.",
    icon: "mdiVectorPolyline",
    date: "2026-08-19",
    version: "v1.3.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.3.0",
  },
  {
    id: "maintenance-scheduling",
    title: "Maintenance scheduling",
    description:
      "Schedule optimal maintenance windows for components (e.g. generators, links) with contiguous downtime blocks, partial outages, and multiple events in a year.",
    icon: "mdiWrenchClock",
    date: "2026-08-19",
    version: "v1.3.0",
    link: "https://docs.pypsa.org/latest/release-notes/#v1.3.0",
  },
];
