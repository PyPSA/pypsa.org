<script lang="ts">
  import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "$lib/components/ui/sheet";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import Icon from "$lib/components/Icon.svelte";
  import GithubIcon from "$lib/icons/GithubIcon.svelte";
  import DiscordIcon from "$lib/icons/DiscordIcon.svelte";
  import ToggleTheme from "$lib/components/ToggleTheme.svelte";
  import { DOCS_BASE_URL } from "$lib/config";
  import { page } from "$app/stores";

  // Active page (for non-anchor subpages)
  $: pathname = $page.url.pathname;
  $: onRoadmap = pathname === "/roadmap";
  $: onEvent = pathname === "/events" || pathname.startsWith("/events/");

  interface RouteProps {
    href: string;
    label: string;
  }

  // Anchor jumps within the landing page (scroll-spy highlighted)
  const sectionLinks: RouteProps[] = [
    { href: "/#features", label: "Features" },
    { href: "/#frameworks", label: "Ecosystem" },
    { href: "/#implementations", label: "Models" },
  ];

  // Standalone internal subpages
  const roadmapLink: RouteProps = { href: "/roadmap", label: "Roadmap" };
  const eventsLink: RouteProps = { href: "/events", label: "Events" };

  // External documentation link
  const docsLink: RouteProps = { href: DOCS_BASE_URL, label: "Docs" };

  let isOpen = false;
  let activeSection = "";

  // Track scroll position to highlight active section
  function updateActiveSection() {
    const sections = ["features", "frameworks", "implementations"];
    const scrollPosition = window.scrollY + 150; // Offset for navbar height

    // Check if we're at or past the contributors section
    const contributorsElement = document.getElementById("contributors");
    if (contributorsElement && scrollPosition >= contributorsElement.offsetTop) {
      activeSection = ""; // Clear active section when in contributors
      return;
    }

    for (let i = sections.length - 1; i >= 0; i--) {
      const element = document.getElementById(sections[i]);
      if (element && scrollPosition >= element.offsetTop) {
        activeSection = sections[i];
        return;
      }
    }

    activeSection = ""; // Clear if not in any section
  }

  // Add scroll listener when component mounts
  import { onMount } from "svelte";

  onMount(() => {
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection);
    return () => window.removeEventListener("scroll", updateActiveSection);
  });
</script>

<header
  class="w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl top-5 mx-auto sticky z-40 rounded-2xl flex justify-between items-center p-2 glass-morphism"
>
  <a href="/" class="font-bold text-lg flex items-center">
    <img
      src="/img/pypsa-logo.svg"
      alt="PyPSA Logo"
      width="36"
      height="36"
      loading="eager"
      decoding="async"
      class="w-9 h-9 mr-2"
    />
    PyPSA
  </a>

  <!-- Mobile -->
  <div class="flex items-center lg:hidden">
    <Sheet bind:open={isOpen}>
      <SheetTrigger aria-label="Open menu">
        <Icon name="menu" class="cursor-pointer" />
      </SheetTrigger>

      <SheetContent
        side="left"
        class="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card"
      >
        <div>
          <SheetHeader class="mb-4 ml-4">
            <SheetTitle class="flex items-center">
              <a href="/" class="flex items-center">
                <img
                  src="/img/pypsa-logo.svg"
                  alt="PyPSA Logo"
                  width="36"
                  height="36"
                  loading="lazy"
                  decoding="async"
                  class="size-9 mr-2"
                />
                PyPSA
              </a>
            </SheetTitle>
          </SheetHeader>

          <div class="flex flex-col gap-2">
            {#each sectionLinks as { href, label } (href)}
              {@const sectionId = href.split("#")[1]}
              <a on:click={() => (isOpen = false)} {href}>
                <Button
                  variant="ghost"
                  class="justify-start text-base w-full transition-all duration-300 hover:bg-primary hover:text-primary-foreground {activeSection ===
                  sectionId
                    ? 'bg-primary/10 text-primary dark:text-foreground border border-primary/20'
                    : ''}"
                >
                  {label}
                </Button>
              </a>
            {/each}

            <Separator class="my-1" />

            {#each [roadmapLink, eventsLink] as { href, label } (href)}
              <a on:click={() => (isOpen = false)} {href}>
                <Button
                  variant="ghost"
                  class="justify-start text-base w-full transition-all duration-300 hover:bg-primary hover:text-primary-foreground {pathname ===
                  href
                    ? 'bg-primary/10 text-primary dark:text-foreground border border-primary/20'
                    : ''}"
                >
                  {label}
                </Button>
              </a>
            {/each}

            <a
              on:click={() => (isOpen = false)}
              href={docsLink.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                class="justify-start text-base w-full transition-all duration-300 hover:bg-[#098754] hover:text-white"
              >
                {docsLink.label}
                <Icon name="external-link" class="ml-1 size-3" />
              </Button>
            </a>
          </div>
        </div>

        <SheetFooter class="flex-col sm:flex-col justify-start items-start">
          <Separator class="mb-2" />
          <ToggleTheme />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
  <div class="hidden lg:flex items-center gap-1">
    <!-- Section jumps (scroll-spy highlighted) -->
    {#each sectionLinks as { href, label } (href)}
      {@const sectionId = href.split("#")[1]}
      <a
        {href}
        class="{buttonVariants({
          variant: 'ghost',
          size: 'default',
        })} transition-all duration-300 {activeSection === sectionId
          ? 'bg-primary/10 text-primary dark:text-foreground border border-primary/20'
          : ''}"
      >
        {label}
      </a>
    {/each}

    <!-- Divider: section jumps | page navigation -->
    <Separator orientation="vertical" class="mx-2 h-6" />

    <!-- Standalone subpage -->
    <a
      href={roadmapLink.href}
      class="{buttonVariants({
        variant: 'ghost',
        size: 'default',
      })} transition-all duration-300 {onRoadmap
        ? 'bg-primary/10 text-primary dark:text-foreground border border-primary/20'
        : ''}"
    >
      {roadmapLink.label}
    </a>

    <!-- Events index -->
    <a
      href={eventsLink.href}
      class="{buttonVariants({
        variant: 'ghost',
        size: 'default',
      })} transition-all duration-300 {onEvent
        ? 'bg-primary/10 text-primary dark:text-foreground border border-primary/20'
        : ''}"
    >
      {eventsLink.label}
    </a>

    <!-- External documentation -->
    <a
      href={docsLink.href}
      target="_blank"
      rel="noopener noreferrer"
      class="{buttonVariants({
        variant: 'ghost',
        size: 'default',
      })} transition-all duration-300"
      style="transition: all 0.3s;"
      on:mouseenter={(e) => (
        (e.currentTarget.style.backgroundColor = "#098754"),
        (e.currentTarget.style.color = "white")
      )}
      on:mouseleave={(e) => (
        (e.currentTarget.style.backgroundColor = ""),
        (e.currentTarget.style.color = "")
      )}
    >
      {docsLink.label}
      <Icon name="external-link" class="ml-1 size-3" />
    </a>
  </div>

  <div class="hidden lg:flex">
    <ToggleTheme />
    <a
      aria-label="Join Discord"
      href="https://discord.gg/AnuJBk23FU"
      target="_blank"
      class="{buttonVariants({
        variant: 'ghost',
        size: 'sm',
      })} hover:bg-primary hover:text-primary-foreground"
    >
      <DiscordIcon class="size-5" />
    </a>
    <a
      aria-label="View on GitHub"
      href="https://github.com/pypsa"
      target="_blank"
      class="{buttonVariants({
        variant: 'ghost',
        size: 'sm',
      })} hover:bg-primary hover:text-primary-foreground"
    >
      <GithubIcon class_="size-5" />
    </a>
  </div>
</header>

<style>
  .glass-morphism {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }

  :global(.dark) .glass-morphism {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }

  .shadow-light {
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.085);
  }

  .shadow-dark {
    box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.141);
  }
</style>
