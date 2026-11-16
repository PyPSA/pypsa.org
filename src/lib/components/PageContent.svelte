<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Inline, PageData } from "$lib/data/pages/types";

  const { page, actions }: { page: PageData; actions?: Snippet } = $props();

  const isExternal = (href: string) => /^https?:/.test(href);
</script>

{#snippet inline(parts: Inline)}
  {#each parts as part, i (i)}
    {#if typeof part === "string"}
      {part}
    {:else}
      <a
        href={part.href}
        class="text-primary underline-offset-4 hover:underline"
        {...isExternal(part.href) ? { target: "_blank", rel: "noreferrer" } : {}}>{part.label}</a
      >
    {/if}
  {/each}
{/snippet}

<article class="container py-24 sm:py-32">
  <p class="text-lg text-primary text-center mb-2 tracking-wider">{page.eyebrow}</p>
  <h1 class="text-3xl md:text-4xl text-center font-bold mb-4">{page.title}</h1>
  <p data-lead class="mx-auto max-w-2xl text-xl text-center text-muted-foreground mb-8">
    {@render inline(page.lead)}
  </p>
  {#if actions}
    <div class="flex justify-center mb-12">{@render actions()}</div>
  {:else}
    <div class="mb-8"></div>
  {/if}

  <div class="mx-auto max-w-3xl">
    {#each page.sections as section (section.id)}
      <section id={section.id} class="mb-10">
        <h2 class="text-xl font-semibold mb-3">{section.heading}</h2>
        {#each section.paragraphs ?? [] as paragraph, i (i)}
          <p class="text-base text-muted-foreground mb-3">{@render inline(paragraph)}</p>
        {/each}
        {#if section.items}
          <ul class="list-disc pl-6 text-base text-muted-foreground">
            {#each section.items as item, i (i)}
              <li class="py-2">{@render inline(item)}</li>
            {/each}
          </ul>
        {/if}
      </section>
    {/each}
  </div>
</article>
