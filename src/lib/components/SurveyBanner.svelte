<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import { bannerKey } from "$lib/survey/prepaint";
  import { surveyWave } from "$lib/survey/current";
  import { lastOpenDay } from "$lib/survey/format";

  function dismiss() {
    // Hiding the focused button would drop focus to <body>, so move it to the page content first.
    const main = document.querySelector<HTMLElement>("main");
    if (main) {
      main.tabIndex = -1;
      main.focus({ preventScroll: true });
    }
    document.documentElement.setAttribute("data-survey-dismissed", "true");
    try {
      localStorage.setItem(bannerKey(surveyWave.wave), "1");
    } catch {
      // Storage blocked, so the banner stays dismissed for this page view only.
    }
  }
</script>

<!-- Prerendered hidden, shown by the pre-paint html attributes. -->
<div
  id="survey-banner"
  data-survey-banner
  class="survey-banner mb-4 bg-primary text-primary-foreground text-sm"
>
  <div class="container flex items-center justify-between gap-3 py-2">
    <p class="flex-1 text-center">
      PyPSA User Survey 2026: help us decide what to build next. 10 to 15 minutes, open until {lastOpenDay(
        surveyWave.closes
      )}.
      <a
        href="/survey"
        class="block py-3 font-semibold underline underline-offset-4 whitespace-nowrap sm:ml-1 sm:inline sm:py-0"
        >Take the survey →</a
      >
    </p>
    <button
      type="button"
      class="-my-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded hover:bg-primary-foreground/20"
      aria-label="Dismiss the survey banner"
      data-survey-banner-dismiss
      onclick={dismiss}
    >
      <Icon name="x" class="size-4" />
    </button>
  </div>
</div>
