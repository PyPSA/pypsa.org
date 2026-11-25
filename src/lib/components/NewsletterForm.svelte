<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { TURNSTILE_SITE_KEY } from "$lib/config/meta";
  import { Turnstile } from "$lib/newsletter/turnstile";

  const { compact = false }: { compact?: boolean } = $props();

  const id = $props.id();
  let email = $state("");
  let token = $state<string | null>(null);
  let status = $state<"idle" | "submitting" | "success" | "error">("idle");
  let message = $state("");
  let loadFailed = false;
  let focused = $state(false);
  let container: HTMLElement | undefined = $state();

  const turnstile = new Turnstile(TURNSTILE_SITE_KEY, () => {
    token = turnstile.token;
  });

  function onFocus() {
    focused = true;
    if (!container) return;
    turnstile
      .load(container)
      .then(() => {
        if (loadFailed) {
          loadFailed = false;
          status = "idle";
          message = "";
        }
      })
      .catch(() => {
        loadFailed = true;
        message = "Could not load the spam check. Disable blockers and try again.";
        status = "error";
      });
  }

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!token || status === "submitting") return;
    status = "submitting";
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, "cf-turnstile-response": token }),
      });
      if (res.status === 200) {
        status = "success";
        message = "Check your inbox to confirm your subscription";
        return;
      }
      const data = await res.json().catch(() => null);
      message =
        typeof data?.error === "string" ? data.error : "Something went wrong. Please try again.";
    } catch {
      message = "Something went wrong. Please try again.";
    }
    status = "error";
    turnstile.reset();
  }
</script>

<div class={compact ? "w-full max-w-md" : "w-full max-w-xl"}>
  {#if status === "success"}
    <p role="status" class="text-sm font-medium">{message}</p>
  {:else}
    <form
      data-newsletter-endpoint="/api/newsletter"
      class="flex flex-col gap-3"
      onsubmit={onSubmit}
    >
      <label for="{id}-email" class={compact ? "sr-only" : "text-sm font-medium"}>
        Email address
      </label>
      <div class={compact ? "flex gap-2" : "flex flex-col sm:flex-row gap-2"}>
        <Input
          id="{id}-email"
          type="email"
          name="email"
          autocomplete="email"
          placeholder={compact ? "Email address" : "you@example.com"}
          required
          class={compact ? "h-11 min-w-0 flex-1 text-ellipsis sm:h-10" : "h-11 sm:h-10"}
          bind:value={email}
          onfocus={onFocus}
        />
        <Button
          type="submit"
          class={compact
            ? "h-11 shrink-0 px-4 sm:h-10 disabled:opacity-60"
            : "h-11 sm:h-10 disabled:opacity-60"}
          disabled={!token || status === "submitting"}
        >
          {status === "submitting" ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>
      <div bind:this={container}></div>
      {#if compact}
        <p class="text-center text-sm text-muted-foreground md:text-left">
          PyPSA news by email.
          <a href="/newsletter" class="inline-block py-2 underline">Learn more</a>
        </p>
      {:else}
        <p class="text-sm text-muted-foreground">
          We email you a confirmation link first. Unsubscribe at any time.
        </p>
      {/if}
      <p aria-live="polite" class="text-xs text-muted-foreground">
        {#if focused && !token && !loadFailed && status !== "error"}
          Verifying you're human…
        {/if}
      </p>
      {#if status === "error"}
        <p role="alert" class="text-sm text-destructive">{message}</p>
      {/if}
    </form>
  {/if}
</div>
