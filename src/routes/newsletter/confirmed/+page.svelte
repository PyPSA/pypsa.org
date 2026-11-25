<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import PageContent from "$lib/components/PageContent.svelte";
  import { newsletterConfirmedPage } from "$lib/data/pages/newsletter";
</script>

<Seo path="/newsletter/confirmed" />

<Navbar />
<PageContent page={newsletterConfirmedPage} />
<Footer />
