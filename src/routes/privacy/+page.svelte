<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import PageContent from "$lib/components/PageContent.svelte";
  import { privacyPage } from "$lib/data/pages/privacy";
</script>

<Seo path="/privacy" />

<Navbar />
<PageContent page={privacyPage} />
<Footer />
