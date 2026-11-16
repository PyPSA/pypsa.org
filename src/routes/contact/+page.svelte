<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import PageContent from "$lib/components/PageContent.svelte";
  import { contactPage } from "$lib/data/pages/contact";
</script>

<Seo path="/contact" />

<Navbar />
<PageContent page={contactPage} />
<Footer />
