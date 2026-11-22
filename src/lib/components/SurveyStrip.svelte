<script lang="ts">
  import type { OutlinePart } from "$lib/survey/outline";

  const { parts, current, reached }: { parts: OutlinePart[]; current: number; reached: number } =
    $props();
  const total = $derived(parts.reduce((n, p) => n + p.pages.length, 0));
</script>

<!-- Status only, the section list is the navigation. -->
<div
  class="flex gap-2.5"
  role="progressbar"
  aria-label="Survey progress"
  aria-valuemin={1}
  aria-valuemax={total}
  aria-valuenow={current + 1}
  aria-valuetext="Page {current + 1} of {total}"
>
  {#each parts as part (part.n)}
    <div class="flex gap-[3px]" style:flex="{part.pages.length} 1 0">
      {#each part.pages as page (page.index)}
        <span
          class="h-1 flex-1 rounded-full {page.index === current
            ? 'bg-primary ring-2 ring-primary/40 ring-offset-1 ring-offset-background'
            : page.index <= reached
              ? 'bg-primary/60'
              : 'bg-border'}"
        ></span>
      {/each}
    </div>
  {/each}
</div>
