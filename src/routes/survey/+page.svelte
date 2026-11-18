<script lang="ts">
  import { onMount, tick } from "svelte";
  import Seo from "$lib/components/Seo.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { Button } from "$lib/components/ui/button";
  import { isOpen } from "$lib/survey/wave";
  import { surveyWave } from "$lib/survey/current";
  import { formatDay as day } from "$lib/survey/format";
  import { hasSavedProgress, resetProgress } from "$lib/survey/progress";
  import type { MountedSurvey, SubmitState } from "$lib/survey/mount";

  const def = surveyWave;
  const w = def.welcome;

  type Phase =
    | "loading"
    | "before"
    | "closed"
    | "welcome"
    | "survey"
    | "completed"
    | "corrupt"
    | "loadFailed";
  let phase = $state<Phase>("loading");
  let submit = $state<SubmitState>({ kind: "idle" });
  let saveFailed = $state(false);
  let copied = $state(false);
  let copyFailed = $state(false);
  let container = $state<HTMLElement>();
  let mounted: MountedSurvey | undefined;
  // Insets of the survey's question column, so the submit status below lines up with it.
  let inset = $state({ left: 0, right: 0 });

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
  }

  let lastFresh = false;

  async function start(fresh: boolean) {
    lastFresh = fresh;
    phase = "loading";
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
        },
        onSaveError: () => (saveFailed = true),
      },
      { fresh }
    );
  }

  function decide() {
    try {
      if (hasSavedProgress(def, localStorage)) void start(false);
      else phase = "welcome";
    } catch (e) {
      if (e instanceof Error && e.name === "SavedProgressError") phase = "corrupt";
      else throw e;
    }
  }

  function startOver() {
    resetProgress(def, localStorage);
    phase = "welcome";
  }

  onMount(() => {
    const now = new Date();
    if (now.getTime() >= Date.parse(def.closes)) phase = "closed";
    else if (!isOpen(def, now)) phase = "before";
    else decide();
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
<main>
  <section class="container py-24 sm:py-32">
    <p class="text-lg text-primary text-center mb-2 tracking-wider">Get involved</p>
    <h1 class="text-3xl md:text-4xl text-center font-bold mb-4">PyPSA User Survey 2026</h1>
    <p class="text-center text-muted-foreground text-balance mb-12">
      {#if phase === "welcome" || phase === "survey" || phase === "loading" || phase === "loadFailed"}
        Your answers are kept in this browser until you submit
      {/if}
    </p>

    {#if phase === "closed"}
      <div class="mx-auto max-w-3xl text-center" data-survey-state="closed">
        <h2 class="text-2xl font-semibold mb-3">The survey is closed</h2>
        <p class="text-lg text-muted-foreground">
          Thank you to everyone who took part. We will publish the results on pypsa.org and announce
          them on the mailing list, Discord and GitHub.
        </p>
      </div>
    {:else if phase === "corrupt"}
      <div class="mx-auto max-w-3xl" role="alert" data-survey-state="corrupt">
        <h2 class="text-2xl font-semibold mb-3">We could not read your saved answers</h2>
        <p class="text-muted-foreground mb-6">
          The answers saved in this browser are damaged. You can start the survey over; the damaged
          answers will be discarded.
        </p>
        <Button class="h-11" onclick={startOver}>Start over</Button>
      </div>
    {:else if phase === "completed"}
      <div class="mx-auto max-w-3xl" data-survey-state="completed">
        <h2 class="text-2xl font-semibold mb-3">Thank you</h2>
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
          {#if copyFailed}
            <span class="text-sm text-muted-foreground" role="status">
              Copy failed. Please copy the link above.
            </span>
          {/if}
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
        {#if saveFailed}
          <p
            role="alert"
            class="mb-4 rounded-md border border-destructive p-3 text-sm"
            data-survey-save-error
          >
            Your answers could not be saved in this browser. If you reload or close this page they
            will be lost.
          </p>
        {/if}
        <div class="survey-host" bind:this={container}></div>
        {#if submit.kind === "retry" || submit.kind === "rejected"}
          <div
            style:margin-left="{inset.left}px"
            style:margin-right="{inset.right}px"
            role="alert"
            class="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-destructive p-3"
            data-survey-submit-error
          >
            <span>{submit.message}</span>
            {#if submit.kind === "retry"}
              <Button class="h-11" onclick={() => mounted?.retry()}>Retry</Button>
            {/if}
          </div>
        {:else if submit.kind === "sending"}
          <p
            style:margin-left="{inset.left}px"
            class="mt-4 text-sm text-muted-foreground"
            role="status"
          >
            Sending your answers…
          </p>
        {/if}
      </div>
    {:else}
      <div class="mx-auto max-w-3xl" data-survey-state={phase}>
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
          <Button size="lg" onclick={() => start(true)}>{w.startLabel}</Button>
        {/if}
      </div>
    {/if}
  </section>
</main>
<Footer />
