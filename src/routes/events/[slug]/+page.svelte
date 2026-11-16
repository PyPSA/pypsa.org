<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { base } from "$app/paths";
  import { avatarSrc, AVATAR_SIZE, imageSize, YOUTUBE_THUMB } from "$lib/images";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";
  import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
  } from "$lib/components/ui/carousel";
  import { ExternalLink, Play, User, Mail, Globe, ArrowLeft, MapPin, X } from "lucide-svelte";
  import LinkedInIcon from "$lib/icons/LinkedInIcon.svelte";
  import Autoplay from "embla-carousel-autoplay";
  import { slide } from "svelte/transition";

  const { data } = $props();
  const event = data.event;

  const linkLabel = (url: string) =>
    url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");

  const autoplayPlugin = Autoplay({ delay: 4000, stopOnInteraction: true });

  const eventDate = new Date(event.date + "T00:00:00");
  const endDateObj = event.endDate ? new Date(event.endDate + "T00:00:00") : null;

  const timeMatch = event.time.match(
    /(\d{1,2}):(\d{2})\s*(am|pm)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(am|pm)\s*\((\w+)\)/i
  );
  const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit" });
  const formattedTime = timeMatch
    ? (() => {
        let sh = parseInt(timeMatch[1]);
        const sm = parseInt(timeMatch[2]);
        if (timeMatch[3].toLowerCase() === "pm" && sh !== 12) sh += 12;
        if (timeMatch[3].toLowerCase() === "am" && sh === 12) sh = 0;
        let eh = parseInt(timeMatch[4]);
        const em = parseInt(timeMatch[5]);
        if (timeMatch[6].toLowerCase() === "pm" && eh !== 12) eh += 12;
        if (timeMatch[6].toLowerCase() === "am" && eh === 12) eh = 0;
        // eslint-disable-next-line svelte/prefer-svelte-reactivity
        const ds = new Date(eventDate);
        ds.setHours(sh, sm);
        // eslint-disable-next-line svelte/prefer-svelte-reactivity
        const de = new Date(eventDate);
        de.setHours(eh, em);
        return `${timeFmt.format(ds)} – ${timeFmt.format(de)} (${timeMatch[7]})`;
      })()
    : event.time;

  function parseUtcOffset(tz: string): number {
    const match = tz.match(/UTC([+-]?\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  function parseTime(t: string): { hours: number; minutes: number } {
    const [h, m] = t.split(":").map(Number);
    return { hours: h, minutes: m };
  }

  const berlinTz = event.timezones.find((tz) => tz.city === "Berlin");
  const berlinOffset = berlinTz ? parseUtcOffset(berlinTz.timezone) : 2;
  const eventStart = berlinTz ? parseTime(berlinTz.localTime) : { hours: 16, minutes: 0 };

  function formatLocalizedTime(hours: number, minutes: number): string {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const d = new Date(eventDate);
    d.setHours(((hours % 24) + 24) % 24, minutes);
    return timeFmt.format(d);
  }

  const heroRefCities = ["New York", "New Delhi"];
  const heroTimezones = heroRefCities
    .map((city) => {
      const tz = event.timezones.find((t) => t.city === city);
      if (!tz) return null;
      const diff = parseUtcOffset(tz.timezone) - berlinOffset;
      const sMin = eventStart.hours * 60 + eventStart.minutes + diff * 60;
      return {
        label: tz.city,
        time: formatLocalizedTime(Math.floor(sMin / 60), sMin % 60),
      };
    })
    .filter(Boolean) as { label: string; time: string }[];

  const daysUntilDeadline = event.talkProposalDeadline
    ? Math.ceil(
        (new Date(event.talkProposalDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  // ponytail: toggle always shown; no overflow detection. Add a clientHeight check if short abstracts get a pointless "Show more".
  const expandedAbstracts = $state<Record<number, boolean>>({});
  const expandedVideos = $state<Record<number, boolean>>({});

  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
</script>

<Seo path="/events/{event.slug}" />

<Navbar />

<main class="container max-w-5xl mx-auto py-20 md:py-32 space-y-10">
  <a
    href="/events"
    class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
  >
    <ArrowLeft class="size-4" /> Back to events
  </a>

  <!-- Banner -->
  {#if event.bannerImage}
    <img
      src="{base}{event.bannerImage}"
      alt={event.title}
      width={imageSize(event.bannerImage).width}
      height={imageSize(event.bannerImage).height}
      loading="eager"
      decoding="async"
      class="h-auto w-full rounded-lg"
    />
  {/if}

  <!-- Hero -->
  <section class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start">
      <!-- Left column -->
      <div class="space-y-6">
        <div class="flex flex-wrap items-center gap-2">
          {#if event.status === "upcoming"}
            <Badge class="bg-[#c30944] text-white hover:bg-[#c30944] cursor-default">Upcoming</Badge
            >
          {:else}
            <Badge variant="secondary">Past Event</Badge>
          {/if}
          <Badge variant="outline">{event.isOnline ? "Online" : "In person"}</Badge>
        </div>

        <h1 class="text-4xl md:text-5xl font-bold">{event.title}</h1>

        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        <p class="text-muted-foreground leading-relaxed">{@html event.introHtml}</p>

        {#if event.organizers}
          {#if event.organizers.length}
            <p class="text-sm text-muted-foreground">
              Organized by
              {#each event.organizers as org, i (org.name)}
                {#if i > 0}&{/if}
                <a
                  href={org.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 align-middle hover:opacity-80"
                >
                  {#if org.logo}
                    <img
                      src="{base}{org.logo}"
                      alt={org.name}
                      width={imageSize(org.logo).width}
                      height={imageSize(org.logo).height}
                      loading="lazy"
                      decoding="async"
                      class="h-4 w-auto"
                    />
                  {/if}
                  <span>{org.name}</span>
                </a>
              {/each}
            </p>
          {/if}
        {:else}
          <p class="text-sm text-muted-foreground">
            Organized by
            <a
              href="https://www.tu.berlin/en/ensys"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 align-middle hover:opacity-80"
            >
              <img
                src="{base}/img/institutions/tu-berlin.svg"
                alt="TU Berlin"
                width={imageSize("/img/institutions/tu-berlin.svg").width}
                height={imageSize("/img/institutions/tu-berlin.svg").height}
                loading="lazy"
                decoding="async"
                class="h-4 w-auto"
              />
              <span>TU Berlin</span>
            </a>
            &
            <a
              href="https://pypsa-meets-earth.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 align-middle hover:opacity-80"
            >
              <img
                src="{base}/img/institutions/pypsa-meets-earth.webp"
                alt="PyPSA meets Earth"
                width={imageSize("/img/institutions/pypsa-meets-earth.webp").width}
                height={imageSize("/img/institutions/pypsa-meets-earth.webp").height}
                loading="lazy"
                decoding="async"
                class="h-4 w-auto"
              />
              <span>PyPSA meets Earth Initiative</span>
            </a>
          </p>
        {/if}
      </div>

      <!-- Right column: calendar card + CTAs -->
      <div class="flex flex-col items-center gap-3 md:sticky md:top-24 mt-8 md:mt-10">
        <div
          class="flex flex-col items-center justify-center border rounded-xl bg-muted/30 px-6 py-4 min-w-[140px]"
        >
          <span class="text-sm font-medium uppercase tracking-wider text-[#c30944]">
            {new Intl.DateTimeFormat("en", { month: "short" }).format(eventDate)}
          </span>
          {#if endDateObj}
            <span class="text-4xl font-bold leading-tight">
              {eventDate.getDate()}–{endDateObj.getDate()}
            </span>
            <span class="text-sm text-muted-foreground">{eventDate.getFullYear()}</span>
          {:else}
            <span class="text-4xl font-bold leading-tight">{eventDate.getDate()}</span>
            <span class="text-sm text-muted-foreground">
              {new Intl.DateTimeFormat("en", { weekday: "long" }).format(eventDate)}
            </span>
            <span class="text-sm text-muted-foreground">{eventDate.getFullYear()}</span>
          {/if}
          <div class="mt-3 border-t pt-3 text-center">
            <span class="text-sm font-medium">{formattedTime}</span>
            {#if heroTimezones.length > 0}
              <div class="mt-1 space-y-0.5">
                {#each heroTimezones as ht (ht.label)}
                  <div class="text-xs text-muted-foreground">{ht.time} ({ht.label})</div>
                {/each}
              </div>
            {/if}
            {#if !event.isOnline}
              <div
                class="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground"
              >
                <MapPin class="size-3" />
                {event.location}
              </div>
            {/if}
          </div>
        </div>
        {#if event.status === "upcoming"}
          <div class="flex flex-col gap-2 w-full">
            {#if event.registrationUrl}
              <Button
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                class="font-bold bg-[#c30944] hover:bg-[#a00738] text-white w-full"
              >
                Register Now
                <ExternalLink class="size-4 ml-2" />
              </Button>
            {/if}
            {#if event.talkProposalUrl}
              <Button
                href={event.talkProposalUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="sm"
                class="font-medium w-full"
              >
                Submit talk proposal
                <ExternalLink class="size-4 ml-2" />
              </Button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </section>

  <!-- Call for lightning talks -->
  {#if event.talkProposalUrl && event.status === "upcoming"}
    <section class="space-y-4">
      <h2 class="text-2xl font-bold">Call for Lightning Talks</h2>
      <ul class="space-y-2 text-muted-foreground list-disc list-inside">
        <li>
          All PyPSA users are encouraged to suggest 10-minute lightning talks about your use of the
          PyPSA framework
        </li>
        <li>
          We are especially interested in the types of problems you are tackling and how you employ
          PyPSA to solve them
        </li>
        <li>Any project could be shown! We are keen to see diverse use cases and ideas</li>
      </ul>
      {#if event.talkProposalDeadline}
        <div>
          <p class="text-sm font-medium">Submissions close on {event.talkProposalDeadline}</p>
          {#if daysUntilDeadline !== null && daysUntilDeadline > 0}
            <p class="text-xs text-muted-foreground">{daysUntilDeadline} days left</p>
          {/if}
        </div>
      {/if}
    </section>
  {/if}

  <!-- Agenda -->
  <section class="space-y-6">
    <h2 class="text-2xl font-bold">Agenda</h2>
    {#if event.agenda?.length}
      {#if event.agenda.every((item) => !item.speaker && !item.time)}
        <!-- Simple agenda: bullet list (title may carry inline HTML) + optional sub-bullets -->
        <ul class="list-disc list-inside space-y-1.5 text-muted-foreground">
          {#each event.agenda as item (item.title)}
            <li>
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html item.title}
              {#if item.points?.length}
                <ul class="mt-1 ml-5 list-disc list-inside space-y-1">
                  {#each item.points as point (point)}
                    <li>{point}</li>
                  {/each}
                </ul>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <table class="w-full border-collapse text-sm">
          <tbody>
            {#each event.agenda as item, i (i)}
              <tr class="border-t border-border/60">
                <td
                  class="w-12 sm:w-16 align-top whitespace-nowrap tabular-nums text-muted-foreground py-3"
                >
                  {item.time ?? ""}
                </td>
                <td class="align-top py-3">
                  {#if item.type === "special"}
                    <span class="font-semibold">{item.title}</span>
                  {:else}
                    <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
                      <!-- Talk content -->
                      <div class="min-w-0 flex-1">
                        <!-- Recording: thumbnail swaps in place for the player -->
                        {#if item.videoId}
                          {#if expandedVideos[i]}
                            <div
                              transition:slide={{ duration: reduceMotion ? 0 : 250 }}
                              class="mb-3"
                            >
                              <div
                                class="aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-muted"
                              >
                                <iframe
                                  src="https://www.youtube-nocookie.com/embed/{item.videoId}?rel=0"
                                  title={item.title}
                                  loading="lazy"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowfullscreen
                                  class="h-full w-full border-0"
                                ></iframe>
                              </div>
                              <button
                                type="button"
                                class="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                                onclick={() => (expandedVideos[i] = false)}
                              >
                                <X class="size-3" /> Hide video
                              </button>
                            </div>
                          {:else}
                            <button
                              type="button"
                              onclick={() => (expandedVideos[i] = true)}
                              aria-label="Watch recording"
                              class="group relative mb-3 block aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-muted ring-primary ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 sm:w-56"
                            >
                              <img
                                src="https://img.youtube.com/vi/{item.videoId}/mqdefault.jpg"
                                alt=""
                                width={YOUTUBE_THUMB.width}
                                height={YOUTUBE_THUMB.height}
                                loading="lazy"
                                decoding="async"
                                class="h-full w-full object-cover transition group-hover:opacity-80"
                              />
                              <span class="absolute inset-0 flex items-center justify-center">
                                <span
                                  class="flex size-12 items-center justify-center rounded-full bg-black/60 text-white transition group-hover:scale-105 group-hover:bg-black/75"
                                >
                                  <Play class="size-5" />
                                </span>
                              </span>
                            </button>
                          {/if}
                        {/if}
                        <div class="text-base font-medium">{item.title}</div>
                        {#if item.abstract}
                          <p
                            class="mt-1 whitespace-pre-line leading-relaxed text-muted-foreground {expandedAbstracts[
                              i
                            ]
                              ? ''
                              : 'line-clamp-4'}"
                          >
                            {item.abstract}
                          </p>
                          <button
                            type="button"
                            aria-expanded={!!expandedAbstracts[i]}
                            class="mt-1 text-xs text-muted-foreground hover:underline"
                            onclick={() => (expandedAbstracts[i] = !expandedAbstracts[i])}
                          >
                            {expandedAbstracts[i] ? "Show less" : "Show more"}
                          </button>
                        {/if}
                        {#if item.links?.length}
                          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                            {#each item.links as link (link)}
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <ExternalLink class="size-3" />
                                {linkLabel(link)}
                              </a>
                            {/each}
                          </div>
                        {/if}
                      </div>
                      <!-- Speaker -->
                      {#if item.speaker}
                        <div class="flex w-full shrink-0 items-center gap-3 sm:block sm:w-28">
                          {#if item.image}
                            <img
                              src="{base}{item.image}"
                              alt={item.speaker}
                              width={imageSize(item.image).width}
                              height={imageSize(item.image).height}
                              loading="lazy"
                              decoding="async"
                              class="size-10 sm:size-16 rounded-full object-cover"
                            />
                          {:else}
                            <div
                              class="flex size-10 sm:size-16 items-center justify-center rounded-full bg-muted text-muted-foreground"
                            >
                              <User class="size-7" />
                            </div>
                          {/if}
                          <div class="min-w-0">
                            <p class="sm:mt-2 font-medium leading-tight">{item.speaker}</p>
                            {#if item.affiliation}
                              <p class="mt-0.5 text-xs leading-tight text-muted-foreground">
                                {item.affiliation}
                              </p>
                            {/if}
                            {#if item.linkedin || item.email || item.website}
                              <div class="mt-1.5 flex items-center gap-2 text-muted-foreground">
                                {#if item.linkedin}
                                  <a
                                    href={item.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn"
                                    class="hover:text-foreground [&>svg]:size-4"
                                  >
                                    <LinkedInIcon />
                                  </a>
                                {/if}
                                {#if item.website}
                                  <a
                                    href={item.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Website"
                                    class="hover:text-foreground"
                                  >
                                    <Globe class="size-4" />
                                  </a>
                                {/if}
                                {#if item.email}
                                  <a
                                    href="mailto:{item.email}"
                                    aria-label="Email"
                                    class="hover:text-foreground"
                                  >
                                    <Mail class="size-4" />
                                  </a>
                                {/if}
                              </div>
                            {/if}
                          </div>
                        </div>
                      {/if}
                    </div>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    {:else}
      <p class="text-muted-foreground">Agenda will be announced soon.</p>
    {/if}
  </section>

  {#if event.people?.length}
    <section class="space-y-3">
      <h2 class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Participants
      </h2>
      <div class="flex flex-wrap gap-x-4 gap-y-2">
        {#each event.people as person (person.url)}
          <a
            href={person.url}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <img
              src={avatarSrc(person.imageUrl)}
              alt={person.name}
              width={AVATAR_SIZE}
              height={AVATAR_SIZE}
              loading="lazy"
              decoding="async"
              class="size-6 rounded-full object-cover"
            />
            <span class="text-sm">{person.name}</span>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <Separator />

  <!-- Previous meetings videos -->
  {#if event.videos.length > 0}
    <section class="space-y-4">
      <h2 class="text-2xl font-bold">Previous Meetings</h2>
      <p class="text-muted-foreground">Watch recordings from past PyPSA user meetings.</p>
      <Carousel opts={{ align: "start", loop: true }} plugins={[autoplayPlugin]}>
        <CarouselContent class="-ml-4">
          {#each event.videos as video (video.videoId)}
            <CarouselItem class="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <a
                href="https://www.youtube.com/watch?v={video.videoId}"
                target="_blank"
                rel="noopener noreferrer"
                class="group block"
              >
                <Card class="overflow-hidden transition-all duration-200 hover:shadow-md">
                  <div class="relative aspect-video bg-muted">
                    <img
                      src="https://img.youtube.com/vi/{video.videoId}/mqdefault.jpg"
                      alt={video.title}
                      width={YOUTUBE_THUMB.width}
                      height={YOUTUBE_THUMB.height}
                      class="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <CardContent class="p-3">
                    <p
                      class="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors"
                    >
                      {video.title}
                    </p>
                  </CardContent>
                </Card>
              </a>
            </CarouselItem>
          {/each}
        </CarouselContent>
        <CarouselPrevious class="max-sm:hidden" />
        <CarouselNext class="max-sm:hidden" />
      </Carousel>
    </section>

    <Separator />
  {/if}

  <!-- Recording permissions -->
  {#if event.isOnline && event.status === "upcoming"}
    <section class="space-y-4">
      <h2 class="text-2xl font-bold">Recording Permissions</h2>
      <div class="space-y-3 text-muted-foreground leading-relaxed">
        <p>
          We'd like to record the entire session and, for people who give their consent, make the
          recordings available after the session under a Creative Commons Attribution ({event.license})
          license to those who were not able to make the meeting.
        </p>
        <p>
          Participants can license their contribution under a {event.license} license at the time of registration.
          This will permit the associated video recording to be shared with a wider audience in the open
          modelling community.
        </p>
        <p>
          Presenters can optionally license their presentations under a {event.license} license. This
          will also facilitate their dissemination and reuse.
        </p>
        <p>
          Open licensing is optional. We will not publish anything without the consent of those
          being recorded. You may withdraw your consent afterwards as well.
        </p>
      </div>
    </section>
  {/if}

  <!-- Contact -->
  <section class="space-y-4">
    <h2 class="text-2xl font-bold">Contact</h2>
    {#if event.contactHtml}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <p class="text-muted-foreground">{@html event.contactHtml}</p>
    {:else}
      <p class="text-muted-foreground">
        For any inquiries, please contact
        <a href="mailto:contact@pypsa.org" class="hover:underline" style="color: #c30944;">
          contact@pypsa.org</a
        >
        or {event.contactName}
        (<a href="mailto:{event.contactEmail}" class="hover:underline" style="color: #c30944;"
          >{event.contactEmail}</a
        >
        /
        <a
          href="https://github.com/{event.contactHandle.replace('@', '')}"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:underline"
          style="color: #c30944;">{event.contactHandle}</a
        >).
      </p>
    {/if}
  </section>

  {#if event.outroText !== null}
    <Separator />

    <section class="text-center py-8">
      <p class="text-lg text-muted-foreground">
        {event.outroText ?? "We look forward to a fruitful exchange with many of you!"}
      </p>
    </section>
  {/if}
</main>

<Footer />
