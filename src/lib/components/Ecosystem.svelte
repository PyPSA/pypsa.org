<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import Icon from "$lib/components/Icon.svelte";
  import GithubIcon from "$lib/icons/GithubIcon.svelte";
  import { base } from "$app/paths";
  import { imageSize } from "$lib/images";
  import { onMount, onDestroy } from "svelte";
  import { ecosystemProjects, ecosystemSection } from "$lib/data/home/ecosystem";

  const projects = ecosystemProjects.map((p) => ({
    ...p,
    image: `${base}${p.image}`,
    imageSize: imageSize(p.image),
    institutions: p.institutions?.map((i) => ({
      ...i,
      logo: `${base}${i.logo}`,
      logoSize: imageSize(i.logo),
    })),
  }));

  const accentColor = "#098754";
  const accentTextColor = "var(--brand-green-text)";
  const accentHoverColor = "#076b43";

  let carouselIndex = 0; // Start with Atlite (index 0) on left, PyPSA (index 1) in middle, Linopy (index 2) on right
  let carouselElement: HTMLElement;
  let isScrolling = false;

  // Track window width for responsive behavior
  let windowWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  let visibleCount = 3;

  function updateWindowSize() {
    if (typeof window === "undefined") return;
    windowWidth = window.innerWidth;

    // Match Features section breakpoints:
    // 1 col (< 640px), 2 col (640px - 1024px), 3 col (>= 1024px)
    if (windowWidth < 640) {
      visibleCount = 1;
    } else if (windowWidth < 1024) {
      visibleCount = 2;
    } else {
      visibleCount = 3;
    }
  }

  let autoPlayInterval: ReturnType<typeof setInterval> | null = null;
  let autoPlayEnabled = true;

  function stopAutoPlay() {
    autoPlayEnabled = false;
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  function handleWheel(event: WheelEvent) {
    if (isScrolling) {
      event.preventDefault();
      return;
    }

    const deltaX = event.deltaX;
    const deltaY = event.deltaY;

    // Check if horizontal scroll is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      event.preventDefault();
      isScrolling = true;

      if (deltaX > 0) {
        showNext();
      } else {
        showPrev();
      }

      stopAutoPlay();

      setTimeout(() => {
        isScrolling = false;
      }, 600);
    }
  }

  onMount(() => {
    updateWindowSize();
    window.addEventListener("resize", updateWindowSize);

    // Add wheel event listener for horizontal scrolling
    if (carouselElement) {
      carouselElement.addEventListener("wheel", handleWheel, { passive: false });
    }

    // Start auto-play carousel every 5 seconds
    autoPlayInterval = setInterval(() => {
      if (autoPlayEnabled) {
        showNext();
      }
    }, 5000);

    return () => {
      window.removeEventListener("resize", updateWindowSize);
      if (carouselElement) {
        carouselElement.removeEventListener("wheel", handleWheel);
      }
    };
  });

  onDestroy(() => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
    }
  });

  let isTransitioning = true;

  function showNext() {
    if (projects.length <= visibleCount) return;
    carouselIndex++;

    // Reset to beginning after animation completes
    if (carouselIndex >= projects.length) {
      setTimeout(() => {
        isTransitioning = false;
        carouselIndex = 0;
        setTimeout(() => {
          isTransitioning = true;
        }, 50);
      }, 500);
    }
  }

  function showPrev() {
    if (projects.length <= visibleCount) return;

    if (carouselIndex === 0) {
      isTransitioning = false;
      carouselIndex = projects.length;
      setTimeout(() => {
        isTransitioning = true;
        carouselIndex--;
      }, 50);
    } else {
      carouselIndex--;
    }
  }

  function accentStyle(_name: string) {
    return `--accent-color: ${accentColor}; --accent-hover-color: ${accentHoverColor};`;
  }
</script>

<section id="frameworks" class="container py-24 sm:py-32">
  <div>
    <div id="frameworks" class="relative -top-32"></div>
    <h2 class="text-lg text-center mb-2 tracking-wider" style={`color: ${accentTextColor};`}>
      {ecosystemSection.eyebrow}
    </h2>

    <h2 class="text-3xl md:text-4xl text-center font-bold mb-4">{ecosystemSection.heading}</h2>

    <h3 class="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
      {ecosystemSection.lead}
    </h3>

    <div class="relative py-8 overflow-x-hidden overflow-y-visible" bind:this={carouselElement}>
      <div
        class="carousel-container pt-4 pb-2"
        style="transform: translateX(-{carouselIndex *
          (100 / visibleCount)}%); transition: {isTransitioning
          ? 'transform 0.5s ease-in-out'
          : 'none'}"
      >
        {#each [...projects, ...projects] as project, idx (project.name + "-" + idx)}
          <div class="carousel-item" style="width: {100 / visibleCount}%">
            <Card
              class="bg-muted/50 shadow-lg shadow-black/10 dark:shadow-white/10 rounded-2xl project-card"
            >
              <CardHeader class="flex justify-center items-center pb-4">
                <div class="project-image">
                  <img
                    src={project.image}
                    alt={project.name}
                    width={project.imageSize.width}
                    height={project.imageSize.height}
                    loading="lazy"
                    decoding="async"
                    class="h-auto w-auto max-w-full max-h-full object-contain transition-all duration-300"
                  />
                </div>
                <CardTitle class="text-xl mb-2 text-center">{project.name}</CardTitle>
              </CardHeader>

              <CardContent class="text-muted-foreground text-center px-6 pb-6">
                <p class="text-sm leading-relaxed mb-6">{project.description}</p>

                {#if project.docsUrl}
                  <div class="flex justify-center gap-2 mb-4">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      class="flex items-center gap-2 accent-hover-only"
                      style={accentStyle(project.name)}
                    >
                      <a
                        href={project.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-2 w-full h-full"
                      >
                        <Icon name="book-open" class="size-4" />
                        Docs
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      class="flex items-center gap-2 accent-hover-only"
                      style={accentStyle(project.name)}
                    >
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-2 w-full h-full"
                      >
                        <GithubIcon class_="size-4" />
                        GitHub
                      </a>
                    </Button>
                  </div>
                {:else if project.websiteUrl}
                  <div class="flex justify-center mb-4">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      class="flex items-center gap-2 accent-hover-only"
                      style={accentStyle(project.name)}
                    >
                      <a
                        href={project.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-2 w-full h-full"
                      >
                        <Icon name="globe" class="size-4" />
                        Website
                      </a>
                    </Button>
                  </div>
                {/if}

                {#if project.institutions && project.institutions.length > 0}
                  <div class="flex justify-center mt-2">
                    <div class="project-badge">
                      <span class="text-xs text-muted-foreground">Led by</span>
                      {#each project.institutions as institution, idx (idx)}
                        <a
                          href={institution.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="project-link"
                          title={institution.name}
                        >
                          <span class="text-xs text-muted-foreground">{institution.name}</span>
                          <img
                            src={institution.logo}
                            alt={institution.name}
                            width={institution.logoSize.width}
                            height={institution.logoSize.height}
                            loading="lazy"
                            decoding="async"
                            class="w-8 h-8 object-contain"
                            on:error={(e) => {
                              console.error("Institution logo failed to load:", institution.logo);
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                          />
                        </a>
                        {#if idx < project.institutions.length - 1}
                          <span class="text-xs text-muted-foreground">&</span>
                        {/if}
                      {/each}
                    </div>
                  </div>
                {/if}
              </CardContent>
            </Card>
          </div>
        {/each}
      </div>
    </div>

    {#if projects.length > visibleCount}
      <!-- Indicator Dots -->
      <div class="flex justify-center mt-0">
        {#each projects as project, index (project.name)}
          {@const normalizedIndex = carouselIndex % projects.length}
          {@const isInRange = index >= normalizedIndex && index < normalizedIndex + visibleCount}
          {@const isWrappedVisible =
            normalizedIndex + visibleCount > projects.length &&
            index < (normalizedIndex + visibleCount) % projects.length}
          {@const isVisible = isInRange || isWrappedVisible}
          <button
            type="button"
            on:click={() => {
              stopAutoPlay();
              carouselIndex = index;
            }}
            class="w-6 h-6 flex items-center justify-center"
            aria-label="Go to {project.name}"
          >
            <span
              class="w-2 h-2 rounded-full transition-all duration-300"
              style="background-color: {isVisible ? accentColor : '#cbd5e1'}"
            ></span>
          </button>
        {/each}
      </div>

      <div class="mt-4 flex justify-center gap-4">
        <button
          class="p-2 rounded-full border border-gray-300 hover:text-white transition-colors"
          type="button"
          on:click={() => {
            stopAutoPlay();
            showPrev();
          }}
          aria-label="Previous tool"
          on:mouseenter={(e) => {
            e.currentTarget.style.backgroundColor = accentColor;
            e.currentTarget.style.borderColor = accentColor;
          }}
          on:mouseleave={(e) => {
            e.currentTarget.style.backgroundColor = "";
            e.currentTarget.style.borderColor = "";
          }}
        >
          <Icon name="arrow-left" class="size-4" />
        </button>

        <button
          class="p-2 rounded-full border border-gray-300 hover:text-white transition-colors"
          type="button"
          on:click={() => {
            stopAutoPlay();
            showNext();
          }}
          aria-label="Next tool"
          on:mouseenter={(e) => {
            e.currentTarget.style.backgroundColor = accentColor;
            e.currentTarget.style.borderColor = accentColor;
          }}
          on:mouseleave={(e) => {
            e.currentTarget.style.backgroundColor = "";
            e.currentTarget.style.borderColor = "";
          }}
        >
          <Icon name="arrow-right" class="size-4" />
        </button>
      </div>
    {/if}
  </div>
</section>

<style>
  :global(.accent-hover-only) {
    transition:
      background-color 0.3s ease,
      border-color 0.3s ease,
      color 0.3s ease;
  }

  :global(.accent-hover-only:hover) {
    border-color: var(--accent-color) !important;
    background-color: var(--accent-hover-color, var(--accent-color)) !important;
    color: #fff !important;
  }

  :global(.accent-hover-only:hover a),
  :global(.accent-hover-only:hover svg) {
    color: inherit !important;
  }

  .carousel-container {
    display: flex;
  }

  .carousel-item {
    flex-shrink: 0;
    padding: 0;
  }
</style>
