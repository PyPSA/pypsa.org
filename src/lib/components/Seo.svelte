<script lang="ts">
  import { absoluteUrl, jsonLdGraph, siteConfig } from "$lib/config/meta";
  import { aliases, getRoute } from "$lib/site/routes";

  /** A registry path, or an alias (canonical points at its target, page is noindex). */
  const { path }: { path: string } = $props();

  const isAlias = $derived(path in aliases);
  const route = $derived.by(() => {
    const r = getRoute(aliases[path] ?? path);
    if (!r) throw new Error(`Seo: no registry route for ${path}`);
    return r;
  });
  const url = $derived(absoluteUrl(route.path));
  const image = $derived(route.ogImage ?? siteConfig.ogImage);
  const isDefaultImage = $derived(image === siteConfig.ogImage);
  // Escape `<` so the JSON can never close the script tag.
  const jsonLdTag = $derived(
    `<script type="application/ld+json">${JSON.stringify(jsonLdGraph()).replace(/</g, "\\u003c")}</` +
      "script>"
  );
</script>

<svelte:head>
  <title>{route.title}</title>
  <meta name="description" content={route.description} />
  <meta name="keywords" content={siteConfig.keywords.join(", ")} />
  {#if isAlias}<meta name="robots" content="noindex" />{/if}
  <link rel="canonical" href={url} />
  <link rel="alternate" type="text/markdown" href={siteConfig.url + route.mdPath} />
  <meta name="is-agentic-site-type" content="docs" />
  <meta property="og:type" content={route.ogType} />
  <meta property="og:site_name" content="PyPSA" />
  <meta property="og:title" content={route.title} />
  <meta property="og:description" content={route.description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />
  {#if isDefaultImage}
    <meta property="og:image:width" content={String(siteConfig.ogImageWidth)} />
    <meta property="og:image:height" content={String(siteConfig.ogImageHeight)} />
  {/if}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={route.title} />
  <meta name="twitter:description" content={route.description} />
  <meta name="twitter:image" content={image} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time JSON from our own config, "<" escaped -->
  {@html jsonLdTag}
</svelte:head>
