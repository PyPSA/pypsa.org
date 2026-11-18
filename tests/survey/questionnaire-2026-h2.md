<!-- Transcribed from the issue's "Questionnaire (final, 2026-h2)" section; notes (> lines) excluded. -->

### Welcome

Help shape the next year of PyPSA

PyPSA is developed by a small team and a wide community. We want to spend our development time on what helps you most. With this survey we want to learn how you use PyPSA, which features you would like to see and where we can make your experience with PyPSA more productive.

- How long the survey takes: 10 to 15 minutes. You can skip any question and any feature section that is not relevant to you.
- What do we use the results for? We publish the results on pypsa.org and use them to set the development priorities for the next year. We repeat the survey every six months, so you can see what changed.
- We do not ask for your name. Organisation and links are optional and never published with your answers. We publish results only in aggregate.
- Your answers are stored in the EU. Details are on our [privacy page](/privacy#user-survey).
- The survey closes on 13 December 2026.

Resources for conducting this survey and for implementing its findings are supported by Breakthrough Energy GRIDS.

Questions about the survey: contact@pypsa.org.


### Part 1: About you

1.1 In which sector do you mainly work? [single] [required]

- University
- Research institute
- Intergovernmental organisation, for example IEA, IRENA, JRC
- Transmission or distribution system operator
- Utility or generation company
- Energy trading company
- Project developer
- Government agency
- Regulator
- Consultancy
- NGO, think tank or foundation
- Other: [open, one line]

1.2 In which country are you based? [single, dropdown of countries] [required]

1.3 How long have you used PyPSA? [single] [optional]

- I have not used it, but I evaluated it or plan to
- Less than 1 year
- 1 to 5 years
- More than 5 years


1.4 How would you describe your seniority level? [single]

- Junior Modeller / PhD Student
- Senior Modeller / Postdoc
- Team Lead / Professor
- Management

### Part 2: How you use PyPSA

2.1 What do you use PyPSA for? [multi]

- Planning future generation, storage and grid capacity (capacity expansion)
- Designing transition pathways across several investment years
- Simulating dispatch, prices and unit commitment with fixed capacities
- Scheduling storage, hydro or trading positions
- Assessing grid congestion, expansion needs or security (N-1)
- Analysing sector coupling (heat, hydrogen, transport, industry)
- Sizing and evaluating individual projects or industrial sites
- Assessing resource adequacy and security of supply
- Evaluating policies and scenarios for decision makers
- Method development and benchmarking
- Teaching
- Other: [open, one line]


2.2 Which regions do your PyPSA models cover? [multi]

- Europe
- North America
- Latin America
- Africa
- Middle East
- Asia
- Oceania
- Global

2.3 How do you usually build your PyPSA models? [multi]

- From scratch in Python with my own data
- With a PyPSA-based model workflow: PyPSA-Eur, PyPSA-Earth, PyPSA-USA, PyPSA-China or another: [open, one line]
- By importing from other tools or formats: [open, one line]

2.4 Which tools from the PyPSA ecosystem do you use directly in your workflow? [multi]

- atlite
- powerplantmatching
- technology-data
- linopy

2.5 How often do you add custom constraints to your models, for example via extra_functionality? [single]

- Never
- Occasionally
- In most models

2.6 How large are your typical models? [sliders]


- Number of snapshots [slider]
- Number of buses (e.g. regions x carrier) [slider]
- Number of components (e.g. sum of generators, links, stores, etc.) [slider]

Spatial scope [multi]

- One site or microgrid
- City or region
- Country
- Several countries or a continent

2.7 Which solvers do you use? [multi]

- open-source (HiGHS, SCIP, etc.)
- proprietary (Gurobi, COPT, Xpress, MOSEK, CPLEX, etc.)
- GPU-based solvers (e.g. cuPDLPx, cuOpt or GPU functionality of other solvers)

2.8 Which PyPSA version do you run most of the time? [single]

- The latest release (1.5)
- An older 1.x release
- A release before 1.0
- I do not know

2.9 Which features released in the last two years have you used, and which were most valuable?

Tick what you have used. Then mark up to three features that made the biggest difference for your work. Tick "New to me" if you did not know a feature existed. [matrix: Used | Among my top 3 | New to me]

| Feature (release) | Used | Top 3 | New to me |
|---|---|---|---|
| Stochastic optimisation across weighted scenarios (v1.0) | | | |
| Flow-based market coupling (v1.5) | | | |
| Risk-averse optimisation with Conditional Value at Risk (v1.0) | | | |
| Directional modelling-to-generate-alternatives (v1.0) | | | |
| Interactive maps with `n.explore()` (v1.0) | | | |
| Plots for every statistic, static and interactive (v0.34, v0.35) | | | |
| Optimisation expressions for custom constraints (v0.32) | | | |
| Excel import and export (v0.34) | | | |
| NetworkCollection to compare several networks (v0.35) | | | |
| Temporal clustering into representative periods (v1.1) | | | |
| Assets that are committable and extendable at the same time (v1.1) | | | |
| Process component with several inputs and outputs (v1.2) | | | |
| Time delays on links and processes (v1.2) | | | |
| Piecewise-linear costs and efficiencies (v1.3) | | | |
| Maintenance scheduling (v1.3) | | | |
| Optimisable phase-shifting transformers (v1.3) | | | |


### Part 3: Rate the roadmap

The PyPSA maintainers have collected candidate features for the next year across different areas. They come from the public roadmap, from feature requests on GitHub and from a comparison with commercial planning tools. They are candidates, not promises. Your ratings decide which ones we build first.

How it works. For each feature, tell us how important it is for your work in the next year. Each feature has a one-sentence explanation under its name. Skip anything you have no view on, a blank counts as no answer.


Scale for every feature: How important is this for your work in the next year?

| 1 | 2 | 3 | 4 | 5 | |
|---|---|---|---|---|---|
| Not relevant | Low | Medium | High | Critical | Unclear what this means |


#### 3.1 Investment and pathway planning

Deciding what to build, retire and keep, and when.

| Feature | Explanation |
|---|---|
| Let the model retire or retrofit assets early | Economic phase-out and repowering decisions instead of fixed technical lifetimes. |
| Technology costs that fall with deployment (endogenous learning) | Learning curves inside the model, so early investment lowers later costs. |
| Fixed cost per unit built | A cost per installed unit, independent of its size, for discrete assets like transformers. |
| Trade off several objectives (multi-objective optimisation) | Explore the best trade-offs between cost, emissions, land use or import dependence. |
| Limit how fast capacity can be built depending on what's built in earlier years | Build-rate caps that depend on what was built in earlier years. |
| Investments that adapt as uncertainty resolves | Decide now, adjust later as costs or policies become known, for example a hydrogen pipeline built only if the carbon price rises. |
| See which inputs drive your results (global sensitivity analysis) | Sample uncertain inputs, run many networks with Monte Carlo and rank the inputs by their effect on the results. |

#### 3.2 Operations, reliability and markets

Running the system and keeping supply secure.

| Feature | Explanation |
|---|---|
| Richer unit commitment | More operational constraints, for example start-up trajectories or ramping costs. |
| Operating reserves and capacity margins | Reserve requirements to which eligible assets contribute spare capacity. |
| Cost of changing dispatch (ramping costs) | Penalise ramping between hours, for example for wear or balancing exposure. |
| Allow constraints to be violated at a price | Penalties instead of an infeasible model. |
| Loss-of-load and unserved-energy metrics | Probabilistic adequacy indicators from outage-sampled runs, including capacity credit. |
| Strategic bidding of market players (Cournot) | Markup or oligopoly behaviour instead of perfect competition. |
| Orchestration layer for connecting multiple PyPSA model instances | For instance, pass capacities from a planning run to a weekly hydro or maintenance schedule and on to hourly dispatch with market stages. Or run day-ahead market followed by redispatch and congestion management. |

#### 3.3 Grid physics and sector networks

More realistic networks for electricity, gas, heat and water.

| Feature | Explanation |
|---|---|
| Voltage and losses in distribution grids (DistFlow) | Linearised power flow for radial networks with PV, batteries, heat pumps and EV charging. |
| Devices that steer power flows (SSSC, UPFC) | Series compensators and flow controllers as optimisable components. |
| Reactive power and voltage limits in optimisation | Convex relaxation of AC power flow in addition to today's DC approximation. |
| Hand results to power flow tools (pandapower, PowSyBl) | Export optimised networks for AC, short-circuit and dynamic checks. |
| Pressure-driven gas pipeline flow (Weymouth) | Linearised pipeline physics with nodal pressures and linepack storage. |
| Temperature levels in heat networks | District heating with supply and return temperatures as model states. |
| Hydro cascades with water travel times and reservoir head | Linked reservoirs with delays, spillage and fill-level dependent efficiency. |

#### 3.4 Analysing and presenting results

From a solved network to a figure, a table or a decision.

| Feature | Explanation |
|---|---|
| Explore a solved network in a dashboard | Launch a local app with statistics, plots and maps. |
| Market statistics out of the box | Price duration curves, congestion rents, market values and asset revenues. |
| Financial metrics per asset | Net present value, levelised cost and payback. |
| Map results back to the original grid (disaggregation) | Disaggregate clustered results to the original nodes and assets. |
| Compare scenarios side by side | Load several runs and difference them in statistics and plots. |

#### 3.5 Data, input and output

Getting models in and out of PyPSA.

| Feature | Explanation |
|---|---|
| Read and write model equations as text | Declare custom constraints without code and export the full formulation as readable maths for papers and audits. |
| Open large networks faster | Load lazily only the parts of a network you need, also from cloud storage, instead of the whole file. |
| Import grid models from industry formats | Read these files directly from CIM-CGMES, MATPOWER, or PSS/E. |
| Store and exchange models in a tool-neutral format | A declared schema that other frameworks and databases can read, with scenario variants that store only their differences, and nothing lost on save and reload. |
| Catch input errors before solving (validation) | Stricter checks with clear messages on what is inconsistent and where. |
| Units on buses and attributes | Declare units once and have them checked and carried through to results. |
| Define your own component types and properties | Add components and shared properties, such as carriers, next to the built-in ones. |
| Directly access data from adjacent tools | More heavy data integration of cost assumptions from technology-data, renewable time series from atlite, power plants from powerplantmatching. |

#### 3.6 Speed and scale

Where your models hit their limits.

3.6.1 Have you hit computational limits with PyPSA in the last year? [multi]

- Solving took too long
- Building the model took too long
- Memory ran out
- The solver struggled numerically, for example slow convergence or spurious infeasibility
- No

3.6.2 What did you do about it? [multi]

- Reduced spatial resolution, for example by clustering
- Reduced temporal resolution or used representative periods
- Split the horizon, for example rolling horizon
- Ran fewer scenarios or sensitivities
- Used a bigger machine or a cluster
- Switched to a commercial solver
- Gave up on that model
- Nothing, the limits were acceptable


3.6.3 How much larger would you like your models to be than what you run today, for example in buses, snapshots or scenarios? [single]

- About the same
- 2 to 5 times
- About 10 times
- 100 times or more

| Feature | Explanation |
|---|---|
| Solve models too large for one solve (decomposition) | Split into coordinated subproblems, for example Benders for investment and dispatch or SDDP for long storage horizons. |
| Mix time resolutions in one model | Hourly where it matters, coarser elsewhere, per bus or carrier. |
| Reduce many scenarios to a few | Generate and reduce scenario sets from weather years, outages or price paths. |
| Run many scenarios in parallel | Launch and collect a batch of runs locally or on a cluster from one call. |

#### 3.7 Your top 3

3.7 Of all the roadmap features, which three would help your work most? [multi, at most 3]


### Part 4: Gaps and your work

4.1 What slows you down when you work with PyPSA, and what is missing? [open, multi-line]

Anything counts: installation, learning, documentation, error messages, debugging infeasible models, build or solve time, memory, changes between versions, custom constraints, data preparation, analysis, lack of graphical user interface, finding help, or a feature that was not on the list. Be concrete about what you were trying to do.

4.2 Share links to your PyPSA papers, models, reports or projects. [open, multi-line]

We collect them for the PyPSA website and for the results report. Public links only.

4.3 Anything else you want to tell us? [open, multi-line]

4.4 Which organisation do you work for? [open, one line]

Optional, but please tell us: it shows how many organisations rely on PyPSA. We never publish individual answers or answers that identify your organisation.

### Thank you

Thank you for your time. We will publish the results on pypsa.org soon and announce them on the mailing list, Discord and GitHub. The ratings feed directly into the next round of prioritisation.

Share the survey: https://pypsa.org/survey [Copy survey link]
