<script>
  import Seo from "$lib/components/Seo.svelte";
  import Community from "$lib/components/Community.svelte";
  import Faq from "$lib/components/FAQ.svelte";
  import Features from "$lib/components/Features.svelte";
  import Ecosystem from "$lib/components/Ecosystem.svelte";
  import Models from "$lib/components/Models.svelte";
  import References from "$lib/components/References.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import Navbar from "$lib/components/Navbar.svelte";

  export let data;
</script>

<Seo path="/" />

<Navbar />
<main>
  <Hero />
  <Features />
  <Ecosystem />
  <Models />
  <Community />
  <References references={data.references} />
  <Faq />
</main>
<Footer />
