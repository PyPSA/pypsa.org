<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import { eventsData } from "$lib/data/events";
  import { goto } from "$app/navigation";

  // "YYYY-MM-DD" → "11 May 2026"
  function formatDate(date?: string): string {
    if (!date) return "";
    const d = new Date(date + "T00:00:00");
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  }

  // "6–8 Jul 2026" — assumes same month/year as start
  function formatDateRange(start: string, end: string): string {
    const startDay = new Date(start + "T00:00:00").getDate();
    return `${startDay}–${formatDate(end)}`;
  }

  // Upcoming soonest-first, past most-recent-first.
  const upcoming = $derived(
    eventsData.filter((e) => e.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date))
  );
  const past = $derived(
    eventsData.filter((e) => e.status === "past").sort((a, b) => b.date.localeCompare(a.date))
  );
</script>

<Seo path="/events" />

<Navbar />

<main>
  <section class="container py-24 sm:py-32">
    <h2 class="text-lg text-primary text-center mb-2 tracking-wider">Get involved</h2>
    <h2 class="text-3xl md:text-4xl text-center font-bold mb-16">Events</h2>

    {#snippet eventTable(list: typeof eventsData, isPast: boolean)}
      <Table class={isPast ? "opacity-90" : ""}>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Register</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each list as e (e.slug)}
            <TableRow class="cursor-pointer" onclick={() => goto(`/events/${e.slug}`)}>
              <TableCell class="font-medium">
                <a href="/events/{e.slug}" class="hover:underline">{e.title}</a>
              </TableCell>
              <TableCell class="text-muted-foreground whitespace-nowrap"
                >{e.endDate ? formatDateRange(e.date, e.endDate) : formatDate(e.date)}</TableCell
              >
              <TableCell class="text-muted-foreground whitespace-nowrap">{e.time}</TableCell>
              <TableCell class="text-muted-foreground">{e.location}</TableCell>
              <TableCell class="whitespace-nowrap">
                <!-- Invite only is inferred from a missing registration link. -->
                {#if e.registrationUrl && e.status === "upcoming"}
                  <a
                    href={e.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onclick={(ev) => ev.stopPropagation()}
                    class="font-medium text-primary underline underline-offset-2">Register</a
                  >
                {:else if e.status === "upcoming"}
                  <span class="text-muted-foreground">Invite only</span>
                {/if}
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    {/snippet}

    <div class="mx-auto max-w-3xl space-y-10">
      {#if upcoming.length}
        <div class="space-y-3">
          <h3 class="text-xl font-semibold">Upcoming</h3>
          {@render eventTable(upcoming, false)}
        </div>
      {/if}

      {#if past.length}
        <div class="space-y-3">
          <h3 class="text-xl font-semibold">Past events</h3>
          {@render eventTable(past, true)}
        </div>
      {/if}
    </div>
  </section>
</main>

<Footer />
