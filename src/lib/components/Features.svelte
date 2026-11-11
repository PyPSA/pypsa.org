<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { onMount } from "svelte";
  import { DOCS_BASE_URL } from "$lib/config";
  import {
    featureCategories,
    featureTabs as tabs,
    featuresSection,
    type FeatureTabId,
  } from "$lib/data/home/features";
  import Icon from "$lib/components/Icon.svelte";
  import MdiIcon from "$lib/components/MdiIcon.svelte";
  import {
    mdiPowerPlugBatteryOutline,
    mdiTransmissionTower,
    mdiSecurity,
    mdiCrane,
    mdiRoad,
    mdiRollerblade,
    mdiCrosshairsQuestion,
    mdiDiversify,
    mdiBankOutline,
    mdiScrewdriver,
    mdiDotsSquare,
    mdiHeatPump,
    mdiLightbulb,
    mdiViewModule,
    mdiCarCruiseControl,
    mdiGridLarge,
    mdiDataMatrix,
    mdiRunFast,
    mdiNotebook,
    mdiLockOpen,
  } from "@mdi/js";
  import {
    Battery,
    PlugZap,
    Zap,
    Shield,
    Building,
    Route,
    RotateCcw,
    TrendingUp,
    Search,
    BookOpen,
    Settings,
    Wrench,
    Grid3X3,
    Thermometer,
    Lightbulb,
    Network,
    Activity,
    Layers,
    Settings2,
    Database,
    Gauge,
    BarChart3,
    Brush,
    Users,
    UsersRound,
    Lock,
    DollarSign,
    Sheet,
    Paintbrush,
    CircleDollarSign,
  } from "lucide-svelte";

  let activeTab: FeatureTabId = "optimization";

  $: currentFeatures = featureCategories[activeTab] || [];

  // Carousel logic with responsive items per page
  let windowWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  let currentPage = 0;
  let featuresPerPage = 12;

  function updateWindowSize() {
    if (typeof window === "undefined") return;
    windowWidth = window.innerWidth;

    // Determine features per page based on breakpoints
    // 1 col (< 640px): max 2 rows = 2 items
    // 2 col (640px - 1024px): max 3 rows = 6 items
    // 4 col (>= 1024px): max 4 rows = 16 items
    if (windowWidth < 640) {
      featuresPerPage = 2;
    } else if (windowWidth < 1024) {
      featuresPerPage = 6;
    } else {
      featuresPerPage = 16;
    }

    // Reset to first page when switching tabs or screen size
    if (currentPage > 0) {
      currentPage = 0;
    }
  }

  onMount(() => {
    updateWindowSize();
    window.addEventListener("resize", updateWindowSize);
    return () => window.removeEventListener("resize", updateWindowSize);
  });

  $: totalPages = Math.ceil(currentFeatures.length / featuresPerPage);

  $: displayedFeatures = currentFeatures.slice(
    currentPage * featuresPerPage,
    (currentPage + 1) * featuresPerPage
  );

  function nextPage() {
    currentPage = (currentPage + 1) % totalPages;
  }

  function prevPage() {
    currentPage = (currentPage - 1 + totalPages) % totalPages;
  }

  // Reset page when switching tabs
  $: if (activeTab) {
    currentPage = 0;
  }

  const iconMap: Record<string, typeof Zap> = {
    battery: Battery,
    plugZap: PlugZap,
    zap: Zap,
    shield: Shield,
    building: Building,
    route: Route,
    rotateCcw: RotateCcw,
    trendingUp: TrendingUp,
    trendingUpArrow: TrendingUp, // Using TrendingUp for scalability
    search: Search,
    bookOpen: BookOpen,
    settings: Settings,
    wrench: Wrench,
    grid3X3: Grid3X3,
    thermometer: Thermometer,
    lightbulb: Lightbulb,
    network: Network,
    simpleGraphql: Network, // Using Network as placeholder for GraphQL icon
    simpleShadow: CircleDollarSign, // Using CircleDollarSign for shadow prices
    simpleGoogleSheets: Sheet, // Using Sheet for statistics
    octiconsPaintbrush: Paintbrush, // Using Paintbrush for visualisations
    peopleGroup: UsersRound, // Using UsersRound for community
    activity: Activity,
    layers: Layers,
    settings2: Settings2,
    database: Database,
    gauge: Gauge,
    barChart3: BarChart3,
    brush: Brush,
    users: Users,
    lock: Lock,
    dollarSign: DollarSign,
  };
</script>

<section id="features" class="container py-24 sm:py-32">
  <h2 class="text-lg text-primary text-center mb-2 tracking-wider">{featuresSection.eyebrow}</h2>

  <h2 class="text-3xl md:text-4xl text-center font-bold mb-4">{featuresSection.heading}</h2>

  <h3 class="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
    {featuresSection.lead}
  </h3>

  <!-- Tabs Navigation -->
  <div class="flex flex-wrap justify-center gap-2 mb-8">
    {#each tabs as tab (tab.id)}
      <button
        class="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 {activeTab ===
        tab.id
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
          : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'}"
        onclick={() => (activeTab = tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- Features Grid -->
  <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4">
    {#key activeTab + "-" + currentPage}
      {#each displayedFeatures as { icon, title, description, docsUrl }, index (title)}
        <div
          class="feature-item {docsUrl ? 'feature-item-link' : ''}"
          style={`animation-delay: ${index * 50}ms`}
          onclick={() => {
            if (docsUrl) {
              window.open(docsUrl, "_blank", "noopener,noreferrer");
            }
          }}
          onkeydown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && docsUrl) {
              window.open(docsUrl, "_blank", "noopener,noreferrer");
            }
          }}
          role={docsUrl ? "button" : undefined}
          tabindex={docsUrl ? 0 : undefined}
        >
          <Card
            class="bg-muted/50 shadow-lg shadow-black/10 dark:shadow-white/10 rounded-2xl feature-card group carousel-item {docsUrl
              ? 'hover:shadow-xl hover:shadow-black/20 dark:hover:shadow-white/20'
              : ''}"
          >
            <CardHeader class="flex justify-center items-center">
              <CardTitle class="text-xl mb-2 flex items-center gap-3">
                <div class="feature-icon">
                  {#if icon === "mdiPowerPlugBattery"}
                    <MdiIcon path={mdiPowerPlugBatteryOutline} class="size-7 text-primary" />
                  {:else if icon === "mdiTransmissionTower"}
                    <MdiIcon path={mdiTransmissionTower} class="size-7 text-primary" />
                  {:else if icon === "mdiSecurity"}
                    <MdiIcon path={mdiSecurity} class="size-7 text-primary" />
                  {:else if icon === "mdiCrane"}
                    <MdiIcon path={mdiCrane} class="size-7 text-primary" />
                  {:else if icon === "mdiRoad"}
                    <MdiIcon path={mdiRoad} class="size-7 text-primary" />
                  {:else if icon === "mdiRollerblade"}
                    <MdiIcon path={mdiRollerblade} class="size-7 text-primary" />
                  {:else if icon === "mdiCrosshairsQuestion"}
                    <MdiIcon path={mdiCrosshairsQuestion} class="size-7 text-primary" />
                  {:else if icon === "mdiDiversify"}
                    <MdiIcon path={mdiDiversify} class="size-7 text-primary" />
                  {:else if icon === "mdiBuildingColumns"}
                    <MdiIcon path={mdiBankOutline} class="size-7 text-primary" />
                  {:else if icon === "mdiScrewdriver"}
                    <MdiIcon path={mdiScrewdriver} class="size-7 text-primary" />
                  {:else if icon === "mdiDotsSquare"}
                    <MdiIcon path={mdiDotsSquare} class="size-7 text-primary" />
                  {:else if icon === "mdiHeatPump"}
                    <MdiIcon path={mdiHeatPump} class="size-7 text-primary" />
                  {:else if icon === "mdiLightbulb"}
                    <MdiIcon path={mdiLightbulb} class="size-7 text-primary" />
                  {:else if icon === "mdiTransmissionTowerApp"}
                    <MdiIcon path={mdiTransmissionTower} class="size-7 text-primary" />
                  {:else if icon === "mdiViewModule"}
                    <MdiIcon path={mdiViewModule} class="size-7 text-primary" />
                  {:else if icon === "mdiCarCruiseControl"}
                    <MdiIcon path={mdiCarCruiseControl} class="size-7 text-primary" />
                  {:else if icon === "mdiGridLarge"}
                    <MdiIcon path={mdiGridLarge} class="size-7 text-primary" />
                  {:else if icon === "mdiDataMatrix"}
                    <MdiIcon path={mdiDataMatrix} class="size-7 text-primary" />
                  {:else if icon === "mdiRunFast"}
                    <MdiIcon path={mdiRunFast} class="size-7 text-primary" />
                  {:else if icon === "mdiNotebook"}
                    <MdiIcon path={mdiNotebook} class="size-7 text-primary" />
                  {:else if icon === "mdiLockOpen"}
                    <MdiIcon path={mdiLockOpen} class="size-7 text-primary" />
                  {:else}
                    <svelte:component this={iconMap[icon]} class="size-7 text-primary" />
                  {/if}
                </div>
                {title}
              </CardTitle>
            </CardHeader>

            <CardContent class="px-6 feature-body">
              <p class="text-sm leading-relaxed">{description}</p>
            </CardContent>
          </Card>
        </div>
      {/each}
    {/key}
  </div>

  <!-- Navigation Arrows -->
  {#if totalPages > 1}
    <div class="flex justify-center mt-6 gap-4">
      <button
        onclick={prevPage}
        class="p-2 rounded-full bg-background border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
        aria-label="Previous page"
      >
        <Icon name="arrow-left" class="size-4" />
      </button>

      <span class="flex items-center text-sm text-muted-foreground px-4">
        Page {currentPage + 1} of {totalPages}
      </span>

      <button
        onclick={nextPage}
        class="p-2 rounded-full bg-background border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
        aria-label="Next page"
      >
        <Icon name="arrow-right" class="size-4" />
      </button>
    </div>
  {/if}

  <!-- CTAs -->
  <div class="mt-8 flex flex-wrap justify-center gap-4">
    <Button
      href={DOCS_BASE_URL}
      target="_blank"
      rel="noopener noreferrer"
      class="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-medium rounded-full group/arrow transition-colors duration-300"
    >
      Explore Documentation
      <Icon
        name="arrow-right"
        class="ml-2 group-hover/arrow:translate-x-1 transition-transform duration-300"
        style="width: 1rem; height: 1rem;"
      />
    </Button>
    <Button
      href="/roadmap"
      variant="outline"
      class="h-12 px-8 font-medium rounded-full group/roadmap transition-colors duration-300"
    >
      View Roadmap
      <Icon
        name="arrow-right"
        class="ml-2 group-hover/roadmap:translate-x-1 transition-transform duration-300"
        style="width: 1rem; height: 1rem;"
      />
    </Button>
  </div>
</section>
