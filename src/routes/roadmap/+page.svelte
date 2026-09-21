<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import MdiIcon from "$lib/components/MdiIcon.svelte";
  import { Card, CardContent } from "$lib/components/ui/card";
  import { roadmapData } from "$lib/data/roadmap";
  import { siteConfig } from "$lib/config/meta";
  import {
    mdiCheck,
    mdiRocketLaunchOutline,
    // planned item icons
    mdiVectorPolyline,
    mdiApi,
    mdiTrayArrowDown,
    mdiContentSaveCheckOutline,
    mdiGrid,
    mdiPlaylistEdit,
    mdiTimelineClockOutline,
    mdiFormatListChecks,
    mdiTrendingDown,
    mdiTagOutline,
    mdiEngineOutline,
    mdiChartScatterPlot,
    mdiViewDashboardOutline,
    mdiTransitConnectionHorizontal,
    // historical (shipped) milestone icons
    mdiSpeedometer,
    mdiTransitConnectionVariant,
    mdiFlagOutline,
    mdiSwapHorizontal,
    mdiVectorLine,
    mdiBatteryChargingOutline,
    mdiTransmissionTower,
    mdiFlashOutline,
    mdiPowerPlugOutline,
    mdiTrendingUp,
    mdiMoleculeCo2,
    mdiPlusBoxMultipleOutline,
    mdiDatabaseOutline,
    mdiSourceBranch,
    mdiFileDocumentOutline,
    mdiLightningBoltOutline,
    mdiFunctionVariant,
    mdiCalculatorVariantOutline,
    mdiCalendarClock,
    mdiScaleBalance,
    mdiChip,
    mdiSpeedometerMedium,
    mdiHexagonMultipleOutline,
    mdiSigma,
    mdiChartBarStacked,
    mdiSineWave,
    mdiChartTimelineVariant,
    mdiClockOutline,
    mdiChartBellCurve,
    mdiChartAreaspline,
    mdiSwapHorizontalBold,
    mdiClockFast,
    mdiVectorTriangle,
    mdiVectorPolygon,
    mdiViewGridOutline,
    mdiCogOutline,
    mdiDeleteOutline,
    mdiMapSearchOutline,
    mdiPlusBoxOutline,
    mdiToggleSwitchOutline,
    mdiTune,
    mdiShapeOutline,
    mdiCheckDecagramOutline,
    mdiFileExcelOutline,
    mdiChartBar,
    mdiChartMultiple,
    mdiFolderMultipleOutline,
    mdiTrophyOutline,
    mdiTagCheckOutline,
    mdiDiceMultipleOutline,
    mdiShieldAlertOutline,
    mdiMapOutline,
    mdiCubeOutline,
    mdiCalendarMultiselect,
    mdiCogSyncOutline,
    mdiCogTransferOutline,
    mdiTimerOutline,
    // newly added historical milestones
    mdiCurrentAc,
    mdiShieldCheckOutline,
    mdiWaveform,
    mdiThermometerLines,
    mdiCallSplit,
    mdiVectorCombine,
    mdiSetMerge,
    mdiFunction,
    mdiArrowDecisionOutline,
    mdiCashMultiple,
    mdiVectorCurve,
  } from "@mdi/js";

  // Map icon name → @mdi/js path. Fallback handled in the template.
  const iconPaths: Record<string, string> = {
    // planned items
    mdiVectorPolyline,
    mdiApi,
    mdiTrayArrowDown,
    mdiContentSaveCheckOutline,
    mdiGrid,
    mdiPlaylistEdit,
    mdiTimelineClockOutline,
    mdiFormatListChecks,
    mdiTrendingDown,
    mdiTagOutline,
    mdiEngineOutline,
    mdiChartScatterPlot,
    mdiViewDashboardOutline,
    mdiTransitConnectionHorizontal,
    // historical (shipped) milestones
    mdiSpeedometer,
    mdiTransitConnectionVariant,
    mdiFlagOutline,
    mdiSwapHorizontal,
    mdiVectorLine,
    mdiBatteryChargingOutline,
    mdiTransmissionTower,
    mdiFlashOutline,
    mdiPowerPlugOutline,
    mdiTrendingUp,
    mdiMoleculeCo2,
    mdiDatabaseOutline,
    mdiFileDocumentOutline,
    mdiLightningBoltOutline,
    mdiFunctionVariant,
    mdiCalculatorVariantOutline,
    mdiScaleBalance,
    mdiSpeedometerMedium,
    mdiHexagonMultipleOutline,
    mdiSigma,
    mdiSourceBranch,
    mdiCalendarClock,
    mdiChip,
    mdiChartBarStacked,
    mdiSineWave,
    mdiChartTimelineVariant,
    mdiClockOutline,
    mdiChartBellCurve,
    mdiChartAreaspline,
    mdiSwapHorizontalBold,
    mdiClockFast,
    mdiVectorTriangle,
    mdiVectorPolygon,
    mdiViewGridOutline,
    mdiDeleteOutline,
    mdiPlusBoxOutline,
    mdiPlusBoxMultipleOutline,
    mdiToggleSwitchOutline,
    mdiShapeOutline,
    mdiCheckDecagramOutline,
    mdiChartBar,
    mdiFolderMultipleOutline,
    mdiTrophyOutline,
    mdiTagCheckOutline,
    mdiDiceMultipleOutline,
    mdiShieldAlertOutline,
    mdiMapOutline,
    mdiCubeOutline,
    mdiCogSyncOutline,
    mdiTimerOutline,
    mdiCogOutline,
    mdiMapSearchOutline,
    mdiFileExcelOutline,
    mdiCalendarMultiselect,
    mdiCogTransferOutline,
    mdiTune,
    mdiChartMultiple,
    mdiCurrentAc,
    mdiShieldCheckOutline,
    mdiWaveform,
    mdiThermometerLines,
    mdiCallSplit,
    mdiVectorCombine,
    mdiSetMerge,
    mdiFunction,
    mdiArrowDecisionOutline,
    mdiCashMultiple,
    mdiVectorCurve,
  };

  // Render `code` spans in descriptions as <code>. Content is hardcoded
  // developer strings (no user input), so escaping + {@html} is safe.
  function formatDescription(text: string): string {
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return escaped.replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-muted px-1 py-0.5 text-[0.85em] font-mono">$1</code>'
    );
  }

  // Planned items (no date) first, then shipped items newest-first.
  const planned = $derived(roadmapData.filter((i) => !i.date));
  const shipped = $derived(
    roadmapData.filter((i) => i.date).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
  );

  // "YYYY-MM-DD" → "11 May 2026"
  function formatDate(date?: string): string {
    if (!date) return "";
    const d = new Date(date + "T00:00:00");
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  }

  const pageTitle = "Roadmap — " + siteConfig.name;
  const pageDescription =
    "What we're planning to build and a selection of what was recently shipped.";
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:image" content={siteConfig.ogImage} />
  <meta property="og:url" content={siteConfig.url + "/roadmap"} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content={pageTitle} />
  <meta property="twitter:description" content={pageDescription} />
  <meta property="twitter:image" content={siteConfig.ogImage} />
</svelte:head>

<Navbar />

<section class="container py-24 sm:py-32">
  <h2 class="text-lg text-primary text-center mb-2 tracking-wider">What's next</h2>
  <h2 class="text-3xl md:text-4xl text-center font-bold mb-4">Roadmap</h2>
  <h3 class="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-16">
    What we're planning to build and a selection of what was recently shipped. If you want to get
    involved, reach out to us or follow along in the
    <a
      href={siteConfig.links.github}
      target="_blank"
      rel="noreferrer"
      class="text-primary underline-offset-4 hover:underline">repositories</a
    >.
  </h3>

  <!-- Timeline: date/label in the left gutter, marker on the line, card on the right -->
  {#snippet row(item: (typeof roadmapData)[number])}
    {@const isShipped = !!item.date}
    <div
      class="relative grid grid-cols-[2.5rem_1fr] md:grid-cols-[7rem_2.5rem_1fr] items-start gap-x-3 mb-3"
    >
      <!-- Left gutter: date for shipped, "Planned" otherwise -->
      <div class="hidden md:block pt-3.5 text-right text-sm leading-tight">
        {#if isShipped}
          <span class="text-muted-foreground">{formatDate(item.date)}</span>
        {:else}
          <span class="text-primary font-medium">Planned</span>
        {/if}
      </div>

      <!-- Marker on the line -->
      <div class="relative flex justify-center pt-3">
        {#if isShipped}
          <span
            class="z-10 flex items-center justify-center size-6 rounded-full ring-4 ring-background"
            style="background-color: #098754;"
          >
            <MdiIcon path={mdiCheck} class="size-4 text-white" />
          </span>
        {:else}
          <span
            class="z-10 size-6 rounded-full border-2 border-primary/60 bg-background ring-4 ring-background"
          ></span>
        {/if}
      </div>

      <!-- Card -->
      <Card
        class="bg-muted/50 dark:bg-card border border-border/50 shadow-sm rounded-xl {isShipped
          ? 'opacity-90'
          : ''}"
      >
        <CardContent class="p-4">
          <div
            class="md:hidden mb-1.5 text-xs font-medium {isShipped
              ? 'text-muted-foreground'
              : 'text-primary'}"
          >
            {isShipped ? formatDate(item.date) : "Planned"}
          </div>
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0">
              {#if item.icon && iconPaths[item.icon]}
                <MdiIcon path={iconPaths[item.icon]} class="size-5 text-primary flex-shrink-0" />
              {:else}
                <MdiIcon path={mdiRocketLaunchOutline} class="size-5 text-primary flex-shrink-0" />
              {/if}
              <h4 class="text-base font-semibold leading-tight">{item.title}</h4>
            </div>
            {#if item.version}
              {#if item.link}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex-shrink-0 text-sm font-medium text-primary hover:underline"
                >
                  {item.version}
                </a>
              {:else}
                <span class="flex-shrink-0 text-sm font-medium text-muted-foreground">
                  {item.version}
                </span>
              {/if}
            {/if}
          </div>
          <p class="text-muted-foreground text-sm mt-1">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html formatDescription(item.description)}
          </p>
        </CardContent>
      </Card>
    </div>
  {/snippet}

  <div class="mx-auto max-w-3xl">
    <!-- Planned items: no connecting line — they are not part of the chronology -->
    {#each planned as item (item.id)}
      {@render row(item)}
    {/each}

    <!-- Shipped milestones: the chronological timeline carries the vertical line -->
    <div class="relative">
      <div
        class="absolute top-2 bottom-2 w-0.5 -translate-x-1/2 bg-border left-[1.25rem] md:left-[9rem]"
        aria-hidden="true"
      ></div>
      {#each shipped as item (item.id)}
        {@render row(item)}
      {/each}
    </div>
  </div>
</section>

<Footer />
