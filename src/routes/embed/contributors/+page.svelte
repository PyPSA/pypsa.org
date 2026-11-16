<script>
  import Community from "$lib/components/Community.svelte";
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="embed-container">
  <Community
    showDiscord={false}
    showHeader={false}
    showFilters={false}
    showPyPSALink={true}
    colorfulImages={true}
    embedMode={true}
  />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  .embed-container {
    min-height: 100vh;
    width: 100%;
  }

  /* Remove extra padding/margins for embedded view */
  :global(.embed-container section) {
    padding-top: 0 !important;
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
    padding-bottom: 0.5rem !important;
  }

  /* Override container padding to match card gaps */
  :global(.embed-container section.container) {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
    max-width: 100% !important;
  }

  /* Reduce margin from header area */
  :global(.embed-container section > div.text-center) {
    margin-bottom: 0.5rem !important;
  }

  /* Remove top padding from relative wrapper */
  :global(.embed-container section > div.relative) {
    padding-top: 0 !important;
  }

  /* Hide stats icon in embed */
  :global(.embed-container .info-badge-trigger) {
    display: none !important;
  }

  /* Override grid to show 10 columns with 4 rows (40 cards) - only in embed */
  :global(.embed-container section#contributors .grid) {
    grid-template-columns: repeat(10, minmax(0, 1fr)) !important;
    gap: 0.5rem !important;
  }

  @media (max-width: 640px) {
    :global(.embed-container section#contributors .grid) {
      grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
    }
  }

  @media (min-width: 641px) and (max-width: 1023px) {
    :global(.embed-container section#contributors .grid) {
      grid-template-columns: repeat(8, minmax(0, 1fr)) !important;
    }
  }
</style>
