<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import { aliases } from "$lib/site/routes";
  import { onMount } from "svelte";

  const alias = "/4th-user-meeting";
  const target = aliases[alias];

  onMount(() => {
    window.location.href = target;
  });
</script>

<svelte:head>
  <meta http-equiv="refresh" content="0;url={target}" />
</svelte:head>

<Seo path={alias} />

<p class="hidden">Redirecting to <a href={target}>{target}</a>…</p>
