<script lang="ts">
  import { ModeWatcher } from "mode-watcher";
  import "../app.css";
  import { spriteMarkup } from "$lib/icons/sprite";
  const { children } = $props();
</script>

<svelte:head>
  <meta name="color-scheme" content="light dark" />
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

{@render children()}
