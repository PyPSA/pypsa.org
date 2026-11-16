<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import PageContent from "$lib/components/PageContent.svelte";
  import { legalPage } from "$lib/data/pages/legal";
</script>

<Seo path="/legal" />

<Navbar />
<PageContent page={legalPage} />
<Footer />
