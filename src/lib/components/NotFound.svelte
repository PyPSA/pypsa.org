<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { Button } from "$lib/components/ui/button";
  import PageContent from "$lib/components/PageContent.svelte";
  import { notFoundPage } from "$lib/data/pages/notFound";
</script>

<svelte:head>
  <title>{notFoundPage.title} — PyPSA</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<Navbar />
<PageContent page={notFoundPage}>
  {#snippet actions()}
    <Button href="/" class="w-full sm:w-auto font-bold bg-[#098754] hover:bg-[#087047] text-white">
      Back to home
    </Button>
  {/snippet}
</PageContent>
<Footer />
