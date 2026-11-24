<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import type { OutlinePage, OutlinePart } from "$lib/survey/outline";

  const {
    parts,
    current,
    reached,
    onGo,
  }: { parts: OutlinePart[]; current: number; reached: number; onGo: (index: number) => void } =
    $props();

  let dialog = $state<HTMLDialogElement>();
  const here = $derived(parts.find((p) => p.pages.some((q) => q.index === current)));
  const herePage = $derived(here?.pages.find((q) => q.index === current));

  // The sheet is hidden from lg up, so close it when the viewport grows past that.
  $effect(() => {
    const mq = window.matchMedia("(min-width:1024px)");
    const onChange = () => mq.matches && dialog?.open && dialog.close();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  });

  function go(index: number) {
    dialog?.close();
    onGo(index);
  }
</script>

{#snippet item(page: OutlinePage, part: string | null)}
  {@const state = page.index === current ? "current" : page.index <= reached ? "done" : "upcoming"}
  <button
    type="button"
    disabled={state === "upcoming"}
    aria-current={state === "current" ? "step" : undefined}
    onclick={() => go(page.index)}
    class="flex w-full items-center gap-2 border-l-2 px-2.5 text-left {part
      ? 'py-2.5'
      : 'py-1.5 pl-[1.375rem]'} {state === 'current'
      ? 'border-primary bg-muted font-semibold text-primary'
      : 'border-border'} {state === 'upcoming'
      ? 'cursor-default text-muted-foreground opacity-60'
      : 'hover:text-primary'}"
  >
    <span>
      {#if part}
        <span class="block text-xs font-normal uppercase tracking-wider text-muted-foreground"
          >{part}</span
        >
      {/if}
      {page.title}
    </span>
    {#if state === "done"}
      <Icon
        name="check"
        class="ml-auto size-3.5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span class="sr-only">done</span>
    {/if}
  </button>
{/snippet}

{#snippet list()}
  <ol class="text-sm">
    {#each parts as part (part.n)}
      <li>
        {#if part.pages.length === 1}
          {@render item(part.pages[0], `Part ${part.n}`)}
        {:else}
          <div
            class="border-l-2 border-border px-2.5 pb-1.5 pt-3.5 {part.pages[0].index > reached
              ? 'text-muted-foreground'
              : ''}"
          >
            <span class="block text-xs uppercase tracking-wider text-muted-foreground"
              >Part {part.n}</span
            >
            <span class="font-semibold">{part.title}</span>
          </div>
          <ol>
            {#each part.pages as page (page.index)}
              <li>{@render item(page, null)}</li>
            {/each}
          </ol>
        {/if}
      </li>
    {/each}
  </ol>
{/snippet}

<nav aria-label="Survey sections" class="sticky top-[7.5rem] hidden lg:block">
  {@render list()}
</nav>

{#if here}
  <div class="sticky top-[6.5rem] z-10 -mt-2.5 mb-4 bg-background py-2.5 lg:hidden">
    <button
      type="button"
      onclick={() => dialog?.showModal()}
      aria-haspopup="dialog"
      class="flex w-full items-center gap-2.5 rounded-md border bg-card px-3 py-2.5 text-left text-sm"
    >
      <span class="whitespace-nowrap text-muted-foreground"
        >Part {here.n}{here.pages.length > 1 ? " ·" : ""}</span
      >
      <span class="min-w-0 flex-1 truncate font-semibold"
        >{here.pages.length > 1 ? herePage?.title : here.title}</span
      >
      <Icon name="chevron-down" class="size-4 shrink-0" />
    </button>
  </div>
{/if}

<!-- A click on the backdrop lands on the dialog itself and closes it. Escape is native. -->
<dialog
  bind:this={dialog}
  aria-label="Survey sections"
  onclick={(e) => e.target === dialog && dialog?.close()}
  class="mx-0 mb-0 mt-auto max-h-[85vh] w-full max-w-none rounded-t-2xl bg-background p-0 text-foreground backdrop:bg-black/40 lg:hidden"
>
  <div class="p-4 pb-6">
    <div class="mb-3 flex items-center justify-between font-semibold">
      Sections
      <button
        type="button"
        onclick={() => dialog?.close()}
        aria-label="Close"
        class="-m-2 inline-flex size-11 items-center justify-center text-muted-foreground"
      >
        <Icon name="x" class="size-5" />
      </button>
    </div>
    {@render list()}
  </div>
</dialog>
