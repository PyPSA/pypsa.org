<script lang="ts">
  import { Separator } from "$lib/components/ui/separator";
  import GithubIcon from "$lib/icons/GithubIcon.svelte";
  import LinkedInIcon from "$lib/icons/LinkedInIcon.svelte";
  import BlueskyIcon from "$lib/icons/BlueskyIcon.svelte";
  import { siteConfig } from "$lib/config/meta";
  import MdiIcon from "$lib/components/MdiIcon.svelte";
  import { mdiYoutube, mdiMastodon } from "@mdi/js";
</script>

<footer id="footer" class="container py-24 pb-16 sm:py-32 sm:pb-24">
  <div class="p-10 bg-muted/50 dark:bg-card border rounded-2xl">
    <div class="flex flex-col md:flex-row justify-between items-center gap-8">
      <!-- Logo and description -->
      <div class="flex flex-col items-center md:items-start">
        <a href="/" class="flex font-bold items-center mb-4">
          <img
            src="/img/pypsa-logo.svg"
            alt="PyPSA Logo"
            width="36"
            height="36"
            loading="lazy"
            decoding="async"
            class="w-9 h-9 mr-2"
          />
          <h3 class="text-2xl">PyPSA</h3>
        </a>
        <p class="text-muted-foreground text-center md:text-left max-w-md">
          Python for Power System Analysis - An open framework for simulating and optimising modern
          power and energy systems.
        </p>
      </div>

      <!-- Social links -->
      <div class="flex flex-col items-center md:items-end gap-4">
        <div class="flex items-center gap-4">
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noreferrer"
            class="opacity-60 hover:opacity-100 transition-opacity"
            aria-label="GitHub"
          >
            <GithubIcon class_="size-5" />
          </a>
          <a
            href={siteConfig.social.discord}
            target="_blank"
            rel="noreferrer"
            class="opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Discord"
          >
            <svg class="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03"
              />
            </svg>
          </a>
          <a
            href={siteConfig.social.youtube}
            target="_blank"
            rel="noreferrer"
            class="opacity-60 hover:opacity-100 transition-opacity"
            aria-label="YouTube"
          >
            <MdiIcon path={mdiYoutube} class="size-5" />
          </a>
          <a
            href={siteConfig.social.linkedin}
            target="_blank"
            rel="noreferrer"
            class="opacity-60 hover:opacity-100 transition-opacity"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </a>
          <a
            href={siteConfig.social.mastodon}
            target="_blank"
            rel="noreferrer"
            class="opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Mastodon"
          >
            <MdiIcon path={mdiMastodon} class="size-5" />
          </a>
          <a
            href={siteConfig.social.bluesky}
            target="_blank"
            rel="noreferrer"
            class="opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Bluesky"
          >
            <BlueskyIcon class_="size-5" />
          </a>
        </div>
      </div>
    </div>

    <Separator class="my-6" />

    <div
      class="flex flex-col md:flex-row md:justify-end items-center gap-4 text-muted-foreground text-sm"
    >
      <div class="flex flex-col items-center md:items-end gap-2">
        <nav class="flex gap-4" aria-label="Site information">
          <a href="/contact" class="hover:text-primary transition-colors">Contact</a>
          <a href="/privacy" class="hover:text-primary transition-colors">Privacy &amp; Legal</a>
        </nav>
        <p>&copy; 2015-2026 PyPSA Contributors</p>
      </div>
    </div>
  </div>
</footer>
