<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import PageContent from "$lib/components/PageContent.svelte";
  import NewsletterForm from "$lib/components/NewsletterForm.svelte";
  import { newsletterPage } from "$lib/data/pages/newsletter";
</script>

<Seo path="/newsletter" />

<Navbar />
<PageContent page={newsletterPage}>
  <NewsletterForm />
</PageContent>
<Footer />
