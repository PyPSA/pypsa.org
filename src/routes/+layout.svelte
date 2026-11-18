<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import "../app.css";
  import { spriteMarkup } from "$lib/icons/sprite";
  import { page } from "$app/state";
  import SurveyBanner from "$lib/components/SurveyBanner.svelte";
  import { prepaintScript } from "$lib/survey/prepaint";
  import { surveyWave } from "$lib/survey/current";
  const { children } = $props();

  // Not on the survey itself, and not on /embed/*, which other sites frame.
  const path = $derived<string>(page.url.pathname.replace(/\/$/, ""));
  const showBanner = $derived(path !== "/survey" && path !== "/embed" && !path.startsWith("/embed/"));
  // Sets data-survey-open / data-survey-dismissed on <html> before first paint (CSP allows inline scripts).
  const prepaint = `<script>${prepaintScript(surveyWave)}</${"script"}>`;
</script>

<svelte:head>
  <meta name="color-scheme" content="light dark" />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time constant from prepaint.ts -->
  {@html prepaint}
</svelte:head>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="0"
  height="0"
  style="position: absolute"
  aria-hidden="true"
  focusable="false"
>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time constant from sprite.ts -->
  {@html spriteMarkup}
</svg>

<ModeWatcher />

{#if showBanner}
  <SurveyBanner />
{/if}

{@render children()}
