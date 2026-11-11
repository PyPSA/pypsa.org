<script lang="ts">
  import { communitySection } from "$lib/data/home/community";
  import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { onMount } from "svelte";
  import { avatarSrc, AVATAR_SIZE } from "$lib/images";

  import DiscordIcon from "$lib/icons/DiscordIcon.svelte";
  import Icon from "$lib/components/Icon.svelte";

  import { contributorsData, dataTimestamp } from "$lib/data/contributors";
  import { browser } from "$app/environment";

  // Props
  interface Props {
    showDiscord?: boolean;
    showHeader?: boolean;
    showFilters?: boolean;
    showPyPSALink?: boolean;
    colorfulImages?: boolean;
    embedMode?: boolean;
  }

  const {
    showDiscord = true,
    showHeader = true,
    showFilters = true,
    showPyPSALink = false,
    colorfulImages = false,
    embedMode = false,
  }: Props = $props();

  // Sort contributors by total contributions (descending), but always put Tom Brown first
  const sortedByContributions = [...contributorsData].sort((a, b) => {
    // Always put Tom Brown first
    if (a.firstName === "Tom" && a.lastName === "Brown") return -1;
    if (b.firstName === "Tom" && b.lastName === "Brown") return 1;

    const aTotal = a.totalContributions || 0;
    const bTotal = b.totalContributions || 0;
    return bTotal - aTotal;
  });

  // Responsive contributors per page
  let windowWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  let contributorsPerPage = embedMode ? 40 : 32; // Embed: 10 columns × 4 rows, Normal: 8 columns × 4 rows

  function updateContributorsPerPage() {
    if (typeof window === "undefined") return;
    windowWidth = window.innerWidth;

    if (embedMode) {
      // Embed mode: 10 columns × 4 rows
      if (windowWidth < 640) {
        contributorsPerPage = 20; // Mobile: 5 columns × 4 rows
      } else if (windowWidth < 1024) {
        contributorsPerPage = 32; // Tablet: 8 columns × 4 rows
      } else {
        contributorsPerPage = 40; // Desktop: 10 columns × 4 rows
      }
    } else {
      // Normal mode
      if (windowWidth < 640) {
        // Mobile (1 card): 4 columns × 3 rows
        contributorsPerPage = 12;
      } else if (windowWidth < 1024) {
        // Tablet (2 cards): 6 columns × 4 rows
        contributorsPerPage = 24;
      } else if (windowWidth < 1280) {
        // Small desktop (3 cards): 8 columns × 4 rows
        contributorsPerPage = 32;
      } else {
        // Large desktop (3 cards): 8 columns × 4 rows
        contributorsPerPage = 32;
      }
    }
  }

  // Initialize on mount
  onMount(() => {
    updateContributorsPerPage();
    window.addEventListener("resize", updateContributorsPerPage);

    // Check URL for filter parameter
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      const filterParam = urlParams.get("filter");
      if (filterParam && repoMap[filterParam]) {
        selectedRepo = filterParam;

        // Expand the appropriate category
        const frameworkRepos = [
          "PyPSA",
          "atlite",
          "linopy",
          "powerplantmatching",
          "technology-data",
        ];
        const modelRepos = ["PyPSA-Eur", "PyPSA-Earth", "PyPSA-USA", "PyPSA-DE"];

        if (frameworkRepos.includes(filterParam)) {
          frameworkExpanded = true;
          modelsExpanded = false;
        } else if (modelRepos.includes(filterParam)) {
          modelsExpanded = true;
          frameworkExpanded = false;
        }
      }
    }

    return () => {
      window.removeEventListener("resize", updateContributorsPerPage);
    };
  });

  let currentPage = $state(0);
  let isTransitioning = false;

  // Filter expansion state
  let frameworkExpanded = $state(false);
  let modelsExpanded = $state(false);
  let selectedRepo = $state<string | null>(null); // null means all projects

  // Repository mapping - maps display name to repo path in data
  const repoMap: Record<string, string> = {
    PyPSA: "PyPSA/PyPSA",
    atlite: "PyPSA/atlite",
    linopy: "PyPSA/linopy",
    powerplantmatching: "PyPSA/powerplantmatching",
    "technology-data": "PyPSA/technology-data",
    "PyPSA-Eur": "PyPSA/pypsa-eur",
    "PyPSA-Earth": "pypsa-meets-earth/pypsa-earth",
    "PyPSA-USA": "PyPSA/pypsa-usa",
    "PyPSA-DE": "PyPSA/pypsa-de",
  };

  function toggleFrameworkExpanded() {
    frameworkExpanded = !frameworkExpanded;
    modelsExpanded = false;
  }

  function toggleModelsExpanded() {
    modelsExpanded = !modelsExpanded;
    frameworkExpanded = false;
  }

  function selectRepo(repoName: string) {
    selectedRepo = repoName;
    currentPage = 0; // Reset to first page when filtering
    // Don't close the expanded category when selecting a sub-option
  }

  function clearFilter() {
    selectedRepo = null;
    currentPage = 0;
  }

  // Filter and sort contributors based on selected repository
  const filteredList = $derived(
    selectedRepo
      ? contributorsData
          .filter((c) => {
            const repoPath = repoMap[selectedRepo as string];
            return (
              c.repoContributions &&
              (c.repoContributions as Record<string, number | undefined>)[repoPath]! > 0
            );
          })
          .map((c) => {
            const repoPath = repoMap[selectedRepo as string];
            const repoContribs =
              (c.repoContributions as Record<string, number | undefined>)[repoPath] || 0;
            const repoPrs = (c.repoPrs as Record<string, number> | undefined)?.[repoPath] || 0;
            const repoIssues =
              (c.repoIssues as Record<string, number> | undefined)?.[repoPath] || 0;
            const repoRevs = (c.repoReviews as Record<string, number> | undefined)?.[repoPath] || 0;
            return {
              ...c,
              // Override stats with repo-specific data
              totalContributions: repoContribs,
              totalMergedPrs: repoPrs,
              totalIssuesCreated: repoIssues,
              totalReviews: repoRevs,
              displayRepoOnly: true,
            };
          })
          .sort((a, b) => {
            // Keep Tom Brown first for PyPSA repository only
            if (selectedRepo === "PyPSA") {
              if (a.firstName === "Tom" && a.lastName === "Brown") return -1;
              if (b.firstName === "Tom" && b.lastName === "Brown") return 1;
            }
            // Otherwise sort by contributions
            return b.totalContributions - a.totalContributions;
          })
      : sortedByContributions
  );

  const teamList = $derived(filteredList);

  const totalPages = $derived(Math.ceil(teamList.length / contributorsPerPage));

  const currentContributors = $derived(
    teamList.slice(currentPage * contributorsPerPage, (currentPage + 1) * contributorsPerPage)
  );

  function nextPage() {
    if (isTransitioning) return;
    isTransitioning = true;
    setTimeout(() => {
      currentPage = (currentPage + 1) % totalPages;
      isTransitioning = false;
    }, 50);
  }

  function prevPage() {
    if (isTransitioning) return;
    isTransitioning = true;
    setTimeout(() => {
      currentPage = (currentPage - 1 + totalPages) % totalPages;
      isTransitioning = false;
    }, 50);
  }
</script>

<!-- Contributors Section -->
<Tooltip.Provider>
  <section
    id="contributors"
    class="container max-w-7xl mx-auto px-4 pt-16 pb-4 sm:pt-24 sm:pb-6 lg:pt-32 lg:pb-8"
  >
    <div class="text-center mb-12">
      {#if showHeader}
        <h2 class="text-lg text-primary text-center mb-3 tracking-wider">
          {communitySection.eyebrow}
        </h2>

        <h2 class="text-3xl md:text-4xl text-center font-bold">{communitySection.heading}</h2>

        <p class="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mt-2">
          {communitySection.lead}
        </p>
      {/if}

      <!-- Filter selector -->
      {#if showFilters}
        <div class="flex justify-center mt-6">
          <div class="flex items-center gap-2 px-2 py-1 flex-wrap">
            {#if !frameworkExpanded && !modelsExpanded}
              <button
                type="button"
                on:click={clearFilter}
                class="px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2 {selectedRepo ===
                null
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border/50 hover:border-primary hover:bg-primary/10 hover:text-primary'}"
              >
                All Projects
              </button>
            {/if}

            <!-- Framework category -->
            {#if !modelsExpanded}
              <button
                type="button"
                on:click={toggleFrameworkExpanded}
                class="px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2 {frameworkExpanded
                  ? 'border-[#098754] bg-[#098754]/10 text-[color:var(--brand-green-text)]'
                  : 'border-border/50 hover:border-[#098754] hover:bg-[#098754]/10 hover:text-[color:var(--brand-green-text)]'}"
                style="transition: all 0.2s ease;"
              >
                Framework {frameworkExpanded ? "▴" : "▾"}
              </button>
            {/if}

            <!-- Framework sub-options (expanding inline) -->
            {#if frameworkExpanded}
              <button
                type="button"
                on:click={() => selectRepo("PyPSA")}
                class="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border border-[#098754]/50 hover:bg-[#098754]/10 hover:text-[color:var(--brand-green-text)] animate-in fade-in slide-in-from-left-2 duration-200 {selectedRepo ===
                'PyPSA'
                  ? 'bg-[#098754]/20'
                  : ''}"
                aria-label="Filter by PyPSA"
              >
                PyPSA
              </button>
              <button
                type="button"
                on:click={() => selectRepo("atlite")}
                class="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border border-[#098754]/50 hover:bg-[#098754]/10 hover:text-[color:var(--brand-green-text)] animate-in fade-in slide-in-from-left-2 duration-200 {selectedRepo ===
                'atlite'
                  ? 'bg-[#098754]/20'
                  : ''}"
                style="animation-delay: 50ms;"
                aria-label="Filter by atlite"
              >
                atlite
              </button>
              <button
                type="button"
                on:click={() => selectRepo("linopy")}
                class="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border border-[#098754]/50 hover:bg-[#098754]/10 hover:text-[color:var(--brand-green-text)] animate-in fade-in slide-in-from-left-2 duration-200 {selectedRepo ===
                'linopy'
                  ? 'bg-[#098754]/20'
                  : ''}"
                style="animation-delay: 100ms;"
                aria-label="Filter by linopy"
              >
                linopy
              </button>
              <button
                type="button"
                on:click={() => selectRepo("powerplantmatching")}
                class="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border border-[#098754]/50 hover:bg-[#098754]/10 hover:text-[color:var(--brand-green-text)] animate-in fade-in slide-in-from-left-2 duration-200 {selectedRepo ===
                'powerplantmatching'
                  ? 'bg-[#098754]/20'
                  : ''}"
                style="animation-delay: 150ms;"
                aria-label="Filter by powerplantmatching"
              >
                powerplantmatching
              </button>
              <button
                type="button"
                on:click={() => selectRepo("technology-data")}
                class="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border border-[#098754]/50 hover:bg-[#098754]/10 hover:text-[color:var(--brand-green-text)] animate-in fade-in slide-in-from-left-2 duration-200 {selectedRepo ===
                'technology-data'
                  ? 'bg-[#098754]/20'
                  : ''}"
                style="animation-delay: 200ms;"
                aria-label="Filter by technology-data"
              >
                technology-data
              </button>
            {/if}

            <!-- Models category -->
            {#if !frameworkExpanded}
              <button
                type="button"
                on:click={toggleModelsExpanded}
                class="px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2 {modelsExpanded
                  ? 'border-[#2993B5] bg-[#2993B5]/10 text-[color:var(--brand-blue-text)]'
                  : 'border-border/50 hover:border-[#2993B5] hover:bg-[#2993B5]/10 hover:text-[color:var(--brand-blue-text)]'}"
                style="transition: all 0.2s ease;"
              >
                Models {modelsExpanded ? "▴" : "▾"}
              </button>
            {/if}

            <!-- Models sub-options (expanding inline) -->
            {#if modelsExpanded}
              <button
                type="button"
                on:click={() => selectRepo("PyPSA-Eur")}
                class="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border border-[#2993B5]/50 hover:bg-[#2993B5]/10 hover:text-[color:var(--brand-blue-text)] animate-in fade-in slide-in-from-left-2 duration-200 {selectedRepo ===
                'PyPSA-Eur'
                  ? 'bg-[#2993B5]/20'
                  : ''}"
                aria-label="Filter by PyPSA-Eur"
              >
                PyPSA-Eur
              </button>
              <button
                type="button"
                on:click={() => selectRepo("PyPSA-Earth")}
                class="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border border-[#2993B5]/50 hover:bg-[#2993B5]/10 hover:text-[color:var(--brand-blue-text)] animate-in fade-in slide-in-from-left-2 duration-200 {selectedRepo ===
                'PyPSA-Earth'
                  ? 'bg-[#2993B5]/20'
                  : ''}"
                style="animation-delay: 50ms;"
                aria-label="Filter by PyPSA-Earth"
              >
                PyPSA-Earth
              </button>
              <button
                type="button"
                on:click={() => selectRepo("PyPSA-USA")}
                class="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border border-[#2993B5]/50 hover:bg-[#2993B5]/10 hover:text-[color:var(--brand-blue-text)] animate-in fade-in slide-in-from-left-2 duration-200 {selectedRepo ===
                'PyPSA-USA'
                  ? 'bg-[#2993B5]/20'
                  : ''}"
                style="animation-delay: 100ms;"
                aria-label="Filter by PyPSA-USA"
              >
                PyPSA-USA
              </button>
              <button
                type="button"
                on:click={() => selectRepo("PyPSA-DE")}
                class="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border border-[#2993B5]/50 hover:bg-[#2993B5]/10 hover:text-[color:var(--brand-blue-text)] animate-in fade-in slide-in-from-left-2 duration-200 {selectedRepo ===
                'PyPSA-DE'
                  ? 'bg-[#2993B5]/20'
                  : ''}"
                style="animation-delay: 150ms;"
                aria-label="Filter by PyPSA-DE"
              >
                PyPSA-DE
              </button>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <div class="relative py-4" style="position: relative;">
      <!-- Contributors grid -->
      <div
        class="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 gap-3 md:gap-4 justify-center relative"
      >
        {#key currentPage}
          {#each currentContributors as { imageUrl, firstName, lastName, socialNetworks, totalContributions, totalMergedPrs, totalIssuesCreated, totalReviews, topRepos }, index (firstName + "-" + lastName)}
            {@const delay = index * 50}
            <div
              class="carousel-item contributor-item group/card"
              style="animation-delay: {delay}ms"
            >
              <a href={socialNetworks[0]?.url} target="_blank" class="contributor-link">
                <div class="contributor-card group/hoverimg">
                  <div class="contributor-header">
                    <div class="contributor-img-wrap">
                      <img
                        src={avatarSrc(imageUrl)}
                        alt=""
                        width={AVATAR_SIZE}
                        height={AVATAR_SIZE}
                        loading="lazy"
                        decoding="async"
                        class="contributor-img {colorfulImages ? 'saturate-100' : ''}"
                      />
                    </div>
                    <div role="heading" aria-level="3" class="contributor-title">
                      <span
                        class="leading-tight"
                        class:text-xs={(firstName + " " + lastName).length > 20}
                      >
                        {firstName}
                        <span class="text-primary">{lastName}</span>
                      </span>
                      {#if totalContributions}
                        <Tooltip.Root>
                          <Tooltip.Trigger
                            class="contributor-badge info-badge-trigger"
                            id={`badge-${index}`}
                            aria-label={`${totalContributions} total contributions`}
                          >
                            <span class="contributor-badge-icon">
                              <span class="contributor-badge-ping hover-ping" aria-hidden="true">
                                <Icon name="chart-column" class="w-4 h-4" aria-hidden="true" />
                              </span>
                              <Icon
                                name="chart-column"
                                class="contributor-badge-glyph"
                                aria-hidden="true"
                              />
                            </span>
                            <span class="sr-only">{totalContributions} total contributions</span>
                          </Tooltip.Trigger>
                          <Tooltip.Content
                            class="bg-popover text-popover-foreground border shadow-md !z-[9999]"
                            sideOffset={5}
                          >
                            <div class="flex flex-col gap-2 text-xs p-1">
                              {#if selectedRepo}
                                <!-- Show repo-specific contributions when filtered -->
                                {#if totalMergedPrs}
                                  <div class="flex items-center gap-2">
                                    <span class="font-semibold text-primary">{totalMergedPrs}</span>
                                    <span>merged PRs</span>
                                  </div>
                                {/if}
                                {#if totalReviews}
                                  <div class="flex items-center gap-2">
                                    <span class="font-semibold text-primary">{totalReviews}</span>
                                    <span>reviews</span>
                                  </div>
                                {/if}
                                {#if totalIssuesCreated}
                                  <div class="flex items-center gap-2">
                                    <span class="font-semibold text-primary"
                                      >{totalIssuesCreated}</span
                                    >
                                    <span>issues & discussions</span>
                                  </div>
                                {/if}
                              {:else}
                                <!-- Show total stats when not filtered -->
                                {#if totalMergedPrs}
                                  <div class="flex items-center gap-2">
                                    <span class="font-semibold text-primary">{totalMergedPrs}</span>
                                    <span>merged PRs</span>
                                  </div>
                                {/if}
                                {#if totalReviews}
                                  <div class="flex items-center gap-2">
                                    <span class="font-semibold text-primary">{totalReviews}</span>
                                    <span>reviews</span>
                                  </div>
                                {/if}
                                {#if totalIssuesCreated}
                                  <div class="flex items-center gap-2">
                                    <span class="font-semibold text-primary"
                                      >{totalIssuesCreated}</span
                                    >
                                    <span>issues & discussions</span>
                                  </div>
                                {/if}
                              {/if}
                              {#if topRepos && topRepos.length > 0 && !selectedRepo}
                                {@const filtered = topRepos.filter(
                                  (repo) =>
                                    !repo.includes("[bot]") && repo !== "pypsa-ariadne-batch"
                                )}
                                {@const hasDE = filtered.includes("pypsa-de")}
                                {@const filteredRepos = filtered
                                  .map((repo) =>
                                    repo === "pypsa-ariadne" && !hasDE ? "pypsa-de" : repo
                                  )
                                  .filter((repo) => repo !== "pypsa-ariadne")}
                                {@const isTomBrown = firstName === "Tom" && lastName === "Brown"}
                                {@const reposToShow =
                                  isTomBrown && !filteredRepos.includes("PyPSA")
                                    ? ["PyPSA", ...filteredRepos]
                                    : filteredRepos}
                                {#if reposToShow.length > 0}
                                  <div
                                    class="flex flex-wrap gap-1 mt-1 pt-2 border-t border-border"
                                  >
                                    {#each reposToShow as repo (repo)}
                                      {@const displayName =
                                        repo === "pypsa"
                                          ? "PyPSA"
                                          : repo === "pypsa-eur"
                                            ? "PyPSA-Eur"
                                            : repo === "pypsa-de"
                                              ? "PyPSA-DE"
                                              : repo === "pypsa-earth"
                                                ? "PyPSA-Earth"
                                                : repo === "pypsa-usa"
                                                  ? "PyPSA-USA"
                                                  : repo === "pypsa-ariadne"
                                                    ? "PyPSA-Ariadne"
                                                    : repo === "pypsa-eur-sec"
                                                      ? "PyPSA-Eur-Sec"
                                                      : repo === "pypsa-earth-sec"
                                                        ? "PyPSA-Earth-Sec"
                                                        : repo === "pypsa-asean"
                                                          ? "PyPSA-ASEAN"
                                                          : repo}
                                      {@const isFrameworkRepo = [
                                        "PyPSA",
                                        "atlite",
                                        "linopy",
                                        "powerplantmatching",
                                        "technology-data",
                                      ].includes(repo)}
                                      {@const isModelRepo = [
                                        "pypsa-eur",
                                        "pypsa-usa",
                                        "pypsa-earth",
                                        "pypsa-de",
                                        "pypsa-ariadne",
                                        "pypsa-eur-sec",
                                        "pypsa-earth-sec",
                                        "pypsa-asean",
                                      ].includes(repo)}
                                      {@const meetsEarthRepos = [
                                        "pypsa-earth",
                                        "pypsa-earth-sec",
                                        "pypsa-asean",
                                      ]}
                                      {@const org = meetsEarthRepos.includes(repo)
                                        ? "pypsa-meets-earth"
                                        : "PyPSA"}
                                      <a
                                        href="https://github.com/{org}/{repo}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="px-2 py-0.5 rounded text-xs font-medium hover:opacity-80 transition-opacity"
                                        style={isFrameworkRepo
                                          ? "background-color: rgba(9, 135, 84, 0.2); color: var(--brand-green-text);"
                                          : isModelRepo
                                            ? "background-color: rgba(41, 147, 181, 0.2); color: var(--brand-blue-text);"
                                            : "background-color: rgba(255, 192, 0, 0.2); color: #FFC000;"}
                                        on:click|stopPropagation
                                      >
                                        {displayName}
                                      </a>
                                    {/each}
                                  </div>
                                {/if}
                              {/if}
                            </div>
                          </Tooltip.Content>
                        </Tooltip.Root>
                      {/if}
                    </div>
                  </div>
                </div>
              </a>
            </div>
          {/each}
        {/key}
      </div>

      <!-- Navigation arrows -->
      <div class="flex justify-center mt-6 gap-4">
        <button
          on:click={prevPage}
          class="p-2 rounded-full bg-background border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
          disabled={totalPages <= 1}
          aria-label="Previous page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>

        <span class="flex items-center text-sm text-muted-foreground px-4">
          Page {currentPage + 1} of {totalPages}
        </span>

        <button
          on:click={nextPage}
          class="p-2 rounded-full bg-background border border-border hover:bg-primary hover:text-primary-foreground transition-colors"
          disabled={totalPages <= 1}
          aria-label="Next page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Timestamp -->
      <div class="text-center mt-4 max-w-3xl mx-auto">
        <p class="text-xs text-muted-foreground">
          {#if dataTimestamp}
            Last updated: {new Date(dataTimestamp).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          {/if}
        </p>
      </div>

      <!-- PyPSA.org link for embed -->
      {#if showPyPSALink}
        <div class="text-center mt-6">
          <Button
            href="https://pypsa.org"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="mr-2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            pypsa.org
          </Button>
        </div>
      {/if}
    </div>
  </section>
</Tooltip.Provider>

{#if showDiscord}
  <!-- Discord Section -->
  <section id="community" class="container py-4 sm:py-6 lg:py-8">
    <div class="lg:w-[60%] mx-auto">
      <Card
        class="bg-background shadow-none text-center flex flex-col items-center justify-center border-0"
      >
        <CardHeader>
          <CardTitle class="text-4xl md:text-5xl font-bold">
            <DiscordIcon class="w-20 h-20 m-auto mb-4" />
            Ready to join our
            <span class="text-transparent bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text">
              Community?
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent class="lg:w-[80%] text-lg text-muted-foreground">
          Connect with other PyPSA users, developers, and researchers. Get help, share ideas, and
          stay updated on the latest developments.
        </CardContent>

        <CardFooter>
          <Button
            href="https://discord.gg/AnuJBk23FU"
            target="_blank"
            rel="noreferrer"
            size="lg"
            class="text-base"
          >
            <DiscordIcon class="w-5 h-5" />
            Join Discord Server
          </Button>
        </CardFooter>
      </Card>
    </div>
  </section>
{/if}

<style>
  @keyframes staggerIn {
    0% {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes moveToBadge {
    0% {
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    100% {
      opacity: 1;
    }
  }

  :global(.carousel-item) {
    animation: staggerIn 0.6s ease-out forwards;
    opacity: 0;
  }

  :global(body) {
    overflow-x: clip;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  :global(.info-badge-trigger) {
    position: relative;
  }

  :global(.info-badge-trigger .hover-ping) {
    opacity: 0;
    color: inherit;
    pointer-events: none;
    will-change: transform, opacity;
  }

  :global(.info-badge-trigger:hover .hover-ping),
  :global(.info-badge-trigger:focus-visible .hover-ping) {
    opacity: 0.9;
    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  @keyframes ping {
    0% {
      transform: scale(1);
      opacity: 0.75;
    }
    75%,
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
</style>
