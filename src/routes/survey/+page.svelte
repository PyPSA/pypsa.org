<script lang="ts">
  import { onMount, tick } from "svelte";
  import Seo from "$lib/components/Seo.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { Button } from "$lib/components/ui/button";
  import { isOpen, waves } from "$lib/survey/wave";
  import { surveyMeta } from "$lib/survey/current";
  import { formatDay as day, lastOpenDay } from "$lib/survey/format";
  import { hasSavedProgress, resetProgress } from "$lib/survey/progress";
  import { openStorage } from "$lib/survey/storage";
  import type { MountedSurvey, NavState, SubmitState } from "$lib/survey/mount";
  import { outline } from "$lib/survey/outline";
  import SurveyNav from "$lib/components/SurveyNav.svelte";
  import SurveyStrip from "$lib/components/SurveyStrip.svelte";

  const def = waves[surveyMeta.wave];
  const w = def.welcome;

  type Phase =
    | "loading"
    | "starting"
    | "before"
    | "closed"
    | "welcome"
    | "survey"
    | "completed"
    | "loadFailed";
  let phase = $state<Phase>("loading");
  let submit = $state<SubmitState>({ kind: "idle" });
  // One never-throwing storage instance shared by the page and the mounted survey.
  const opened = openStorage(() => localStorage);
  let welcome = $state<HTMLElement>();
  let skeletonHeight = $state(0);
  type SurveyState = "open" | "before" | "closed" | "resume" | "nostorage";
  // Mirrors the html attribute the pre-paint script set, so the CSS follows the page.
  const setState = (s: SurveyState) =>
    document.documentElement.setAttribute("data-survey-state", s);
  opened.onFallback(() => setState("nostorage"));
  let copied = $state(false);
  let copyFailed = $state(false);
  let container = $state<HTMLElement>();
  let mounted: MountedSurvey | undefined;
  // Insets of the survey's question column, so the submit status below lines up with it.
  let inset = $state({ left: 0, right: 0 });
  // Left inset of the page title, so the Part 3 header above it lines up with it.
  let titleLeft = $state(0);
  let nav = $state<NavState>();
  let top = $state<HTMLElement>();
  const parts = $derived(nav ? outline(def, nav.titles) : []);
  // Part 3's pages carry no Part in their titles, so the page names it and the first one shows its intro.
  const multi = $derived(
    parts.find((p) => p.pages.length > 1 && p.pages.some((q) => q.index === nav?.current))
  );

  // Polite live region, text swapped in so screen readers announce it.
  let announcement = $state("");

  // Only the latest showPage run applies.
  let showRun = 0;
  let errorsPending = false;

  // The one path after any page change, scrolling, focusing the title or first error, and announcing.
  async function showPage(withErrors = false) {
    if (withErrors) errorsPending = true;
    const run = ++showRun;
    await tick();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (run !== showRun) return;
    top?.scrollIntoView({ block: "start" });
    const error = errorsPending
      ? container?.querySelector<HTMLElement>(".sd-question--error")
      : null;
    errorsPending = false;
    const title =
      phase === "completed"
        ? document.querySelector<HTMLElement>("[data-survey-thanks]")
        : container?.querySelector<HTMLElement>(".sd-page__title");
    if (error) {
      error.scrollIntoView({ block: "start" });
      const target = error.querySelector<HTMLElement>("input, select, textarea, button") ?? error;
      if (target === error) error.tabIndex = -1;
      target.focus({ preventScroll: true });
    } else if (title) {
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
    }
    if (phase === "completed") announcement = "Thank you";
    else if (nav)
      announcement = `Page ${nav.current + 1} of ${nav.titles.length}: ${nav.titles[nav.current]}`;
  }

  // After a failed validation: show the page, then bring the first error into view.
  function showErrors() {
    return showPage(true);
  }

  function goTo(index: number) {
    if (mounted && !mounted.goTo(index)) void showErrors();
  }

  // Seconds until a rate limited submit can be retried.
  let countdown = $state(0);
  $effect(() => {
    if (submit.kind !== "rateLimited") return;
    countdown = submit.retryAfter;
    const timer = setInterval(() => {
      countdown = Math.max(0, countdown - 1);
      if (countdown === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  });

  function measureInset() {
    const content = container?.querySelector<HTMLElement>(".sd-page__content");
    if (!container || !content) return;
    const host = container.getBoundingClientRect();
    const box = content.getBoundingClientRect();
    const cs = getComputedStyle(content);
    inset = {
      left: box.left - host.left + parseFloat(cs.paddingLeft),
      right: host.right - box.right + parseFloat(cs.paddingRight),
    };
    const title = container.querySelector<HTMLElement>(".sd-page__title");
    titleLeft = title ? title.getBoundingClientRect().left - host.left : inset.left;
  }

  // SurveyJS switches to its mobile layout after the first render, which moves the columns.
  $effect(() => {
    if (!container) return;
    const ro = new ResizeObserver(measureInset);
    ro.observe(container);
    return () => ro.disconnect();
  });

  let lastFresh = false;

  // Fetch the survey chunk ahead of Start; the import is cached for the real one.
  const prefetch = () => void import("$lib/survey/mount").catch(() => {});
  $effect(() => {
    if (phase !== "welcome") return;
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(prefetch);
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(prefetch, 1500);
    return () => clearTimeout(id);
  });

  async function start(fresh: boolean) {
    lastFresh = fresh;
    skeletonHeight = welcome?.offsetHeight ?? skeletonHeight;
    phase = "starting";
    let mod: typeof import("$lib/survey/mount");
    try {
      // SurveyJS stays out of the page bundle and loads only when the survey starts.
      mod = await import("$lib/survey/mount");
    } catch {
      phase = "loadFailed";
      return;
    }
    phase = "survey";
    await tick();
    mounted = mod.mountSurvey(
      container!,
      def,
      {
        onSubmitState: (s) => {
          measureInset();
          submit = s;
        },
        onCompleted: () => {
          mounted?.destroy();
          mounted = undefined;
          phase = "completed";
          void showPage();
        },
        onInvalid: () => void showErrors(),
        onSaveError: () => setState("nostorage"),
        onPage: async (s) => {
          nav = s;
          await tick();
          measureInset();
          void showPage();
        },
      },
      { fresh, opened }
    );
  }

  const openState = (): SurveyState => (opened.persistent() ? "open" : "nostorage");

  function decide() {
    let resume = false;
    try {
      resume = hasSavedProgress(def, opened.storage);
    } catch (e) {
      if (!(e instanceof Error && e.name === "SavedProgressError")) throw e;
      // Unreadable answers are of no use to anyone, so drop them and start fresh.
      resetProgress(def, opened.storage);
    }
    if (resume) {
      setState("resume");
      void start(false);
    } else {
      setState(openState());
      phase = "welcome";
    }
  }

  onMount(() => {
    const now = new Date();
    if (now.getTime() >= Date.parse(def.closes)) {
      setState("closed");
      phase = "closed";
    } else if (!isOpen(def, now)) {
      setState("before");
      phase = "before";
    } else decide();
    return () => mounted?.destroy();
  });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(def.thankYou.shareUrl);
      copyFailed = false;
      copied = true;
      setTimeout(() => (copied = false), 3000);
    } catch {
      copied = false;
      copyFailed = true;
    }
  }
</script>

<Seo path="/survey" />
<svelte:window onresize={measureInset} />

<Navbar />
<div class="sr-only" aria-live="polite" data-survey-announce>{announcement}</div>
<main>
  <section class="container py-24 sm:py-32">
    <p class="text-lg text-primary text-center mb-2 tracking-wider">Get involved</p>
    <h1 class="text-3xl md:text-4xl text-center font-bold mb-4">{def.title}</h1>
    <p class="text-center text-muted-foreground text-balance mb-12">
      <span data-survey-subtitle="default"
        >Takes 10 to 15 minutes, open until {lastOpenDay(def.closes)}</span
      >
      <span data-survey-subtitle="nostorage"
        >Your browser blocks storage, so answers are kept only until you leave this page.</span
      >
      <span data-survey-subtitle="closed">Thank you to everyone who took part</span>
    </p>

    {#if phase === "closed" || phase === "loading"}
      <div
        class="mx-auto max-w-3xl text-center"
        class:survey-closed-prepaint={phase === "loading"}
        data-survey-state="closed"
      >
        <h2 class="text-2xl font-semibold mb-3">The survey is closed</h2>
        <p class="text-lg text-muted-foreground">
          Thank you to everyone who took part. We will publish the results on pypsa.org and announce
          them on the mailing list, Discord and GitHub.
        </p>
      </div>
    {/if}
    {#if phase === "completed"}
      <div class="mx-auto max-w-3xl" data-survey-state="completed">
        <h2 class="text-2xl font-semibold mb-3" data-survey-thanks>Thank you</h2>
        <p class="text-lg text-muted-foreground mb-6">{def.thankYou.text}</p>
        <p class="flex flex-wrap items-center gap-3">
          <span
            >{def.thankYou.shareLabel}
            <a class="text-primary underline underline-offset-2" href={def.thankYou.shareUrl}
              >{def.thankYou.shareUrl}</a
            ></span
          >
          <Button variant="outline" class="h-11 sm:h-10" onclick={copyLink}>
            {copied ? "Copied" : def.thankYou.copyLabel}
          </Button>
          <span class="text-sm text-muted-foreground" role="status"
            >{copied
              ? "Copied"
              : copyFailed
                ? "Copy failed. Please copy the link above."
                : ""}</span
          >
        </p>
      </div>
    {:else if phase === "loadFailed"}
      <div class="mx-auto max-w-3xl" role="alert" data-survey-state="loadFailed">
        <h2 class="text-2xl font-semibold mb-3">The survey could not be loaded</h2>
        <p class="text-muted-foreground mb-6">
          Please check your connection and try again. Your saved answers are kept.
        </p>
        <Button class="h-11" onclick={() => start(lastFresh)}>Try again</Button>
      </div>
    {:else if phase === "survey"}
      <div class="mx-auto max-w-6xl" data-survey-state="survey">
        <!-- Sticks at the viewport top so its background masks what scrolls behind the navbar. -->
        <div class="sticky top-0 z-30 -mt-12 mb-3 bg-background pb-3 pt-[5.5rem]">
          {#if nav}
            <SurveyStrip {parts} current={nav.current} reached={nav.reached} />
          {/if}
        </div>
        <div
          bind:this={top}
          class="scroll-mt-[6.5rem] lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-8"
        >
          {#if nav}
            <SurveyNav {parts} current={nav.current} reached={nav.reached} onGo={goTo} />
          {/if}
          <div>
            {#if multi}
              <div style:margin-left="{titleLeft}px" style:margin-right="{inset.right}px">
                <!-- The section button names the part on mobile already. -->
                <p class="text-sm uppercase tracking-wider text-primary max-lg:hidden">
                  Part {multi.n} · {multi.title}
                </p>
                {#if multi.pages[0].index === nav?.current}
                  <div class="mt-3 rounded-lg border bg-muted/50 p-4" data-survey-part-intro>
                    <p>{def.part3.intro}</p>
                    <p class="mt-2 text-muted-foreground">{def.part3.howItWorks}</p>
                  </div>
                {/if}
              </div>
            {/if}
            <div class="survey-host" bind:this={container}></div>
            <div
              style:margin-left="{inset.left}px"
              style:margin-right="{inset.right}px"
              role="alert"
              data-survey-submit-error
            >
              {#if submit.kind === "retry" || submit.kind === "rateLimited" || submit.kind === "rejected"}
                <div
                  class="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-destructive p-3"
                >
                  <span>{submit.message}</span>
                  {#if submit.kind === "retry"}
                    <Button class="h-11" onclick={() => mounted?.retry()}>Retry</Button>
                  {:else if submit.kind === "rateLimited"}
                    <Button
                      class="h-11 disabled:border disabled:bg-muted disabled:text-foreground disabled:opacity-100"
                      disabled={countdown > 0}
                      onclick={() => mounted?.retry()}
                    >
                      {countdown > 0 ? `Retry in ${countdown}s` : "Retry"}
                    </Button>
                  {/if}
                </div>
              {/if}
            </div>
            <p
              style:margin-left="{inset.left}px"
              class="text-sm text-muted-foreground {submit.kind === 'sending' ? 'mt-4' : ''}"
              role="status"
            >
              {submit.kind === "sending" ? "Sending your answers…" : ""}
            </p>
          </div>
        </div>
      </div>
    {:else if phase === "starting"}
      <div
        class="survey-skeleton mx-auto max-w-3xl"
        style:min-height={skeletonHeight ? `${skeletonHeight}px` : undefined}
        role="status"
        aria-busy="true"
        data-survey-state="starting"
      >
        <Button size="lg" disabled>Loading…</Button>
      </div>
    {:else if phase === "welcome" || phase === "before" || phase === "loading"}
      {#if phase === "loading"}
        <div
          class="survey-skeleton survey-skeleton-prepaint mx-auto max-w-3xl"
          aria-hidden="true"
        ></div>
      {/if}
      <div
        class="mx-auto max-w-3xl"
        bind:this={welcome}
        data-survey-welcome
        data-survey-state={phase}
      >
        <h2 class="text-2xl font-semibold mb-3">{w.title}</h2>
        {#each w.intro as paragraph (paragraph)}
          <p class="text-lg text-muted-foreground mb-4">{paragraph}</p>
        {/each}
        <ul class="list-disc pl-6 space-y-2 mb-6 text-muted-foreground">
          {#each w.bullets as segments, i (i)}
            <li>
              {#each segments as seg, j (j)}
                {#if seg.href}<a href={seg.href} class="text-primary underline underline-offset-2"
                    >{seg.text}</a
                  >{:else}{seg.text}{/if}
              {/each}
            </li>
          {/each}
        </ul>
        <p class="text-muted-foreground mb-4">{w.support}</p>
        <p class="text-muted-foreground mb-8">
          {w.contactLine}
          <a class="text-primary underline underline-offset-2" href={`mailto:${def.contact}`}
            >{def.contact}</a
          >.
        </p>
        {#if phase === "before"}
          <p class="font-semibold" data-survey-opens>The survey opens on {day(def.opens)}.</p>
        {:else if phase === "welcome"}
          <Button size="lg" onclick={() => start(true)} onpointerenter={prefetch} onfocus={prefetch}
            >{w.startLabel}</Button
          >
        {/if}
      </div>
    {/if}
  </section>
</main>
<Footer />
