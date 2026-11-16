<script lang="ts">
  import { page } from "$app/state";
  import Footer from "$lib/components/Footer.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import NotFound from "$lib/components/NotFound.svelte";
</script>

{#if page.status === 404}
  <NotFound />
{:else}
  <Navbar />
  <main class="mx-auto max-w-3xl px-4 py-24 text-center">
    <p class="text-sm font-medium text-gray-500">{page.status}</p>
    <h1 class="mt-2 text-3xl font-bold">Something went wrong</h1>
    <p class="mt-4 text-gray-600">{page.error?.message}</p>
    <p class="mt-6"><a href="/" class="underline">Back to the homepage</a></p>
  </main>
  <Footer />
{/if}
