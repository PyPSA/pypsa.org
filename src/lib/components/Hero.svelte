<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import Icon from "$lib/components/Icon.svelte";
  import GithubIcon from "$lib/icons/GithubIcon.svelte";
  import { hero } from "$lib/data/home/hero";
</script>

<section class="container">
  <div class="grid place-items-center lg:max-w-screen-xl gap-8 mx-auto py-20 md:py-32">
    <div class="text-center space-y-8">
      <a href={hero.event.href} class="no-underline">
        <Badge
          variant="outline"
          class="text-sm py-2 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <span class="mr-2">
            <Badge class="pointer-events-none bg-[#c30944] text-white">{hero.event.label}</Badge>
          </span>
          <span>{hero.event.text}</span>
          <Icon name="arrow-right" class="size-4 ml-2" />
        </Badge>
      </a>

      <div class="max-w-screen-md mx-auto text-center text-4xl sm:text-5xl md:text-6xl font-bold">
        <h1>
          {hero.headline.before}<br />
          <span class="text-transparent bg-gradient-to-r from-[#D247BF] to-primary bg-clip-text">
            {hero.headline.highlight}
          </span>
          {hero.headline.after}
        </h1>
      </div>

      <p class="max-w-screen-sm mx-auto text-xl text-muted-foreground">
        {hero.lead.line1}<br />
        {hero.lead.line2}
      </p>

      <div class="flex flex-col md:flex-row items-center gap-4 md:gap-4 md:justify-center">
        <Button
          href={hero.primaryCta.href}
          target="_blank"
          rel="noreferrer"
          class="w-full md:w-auto font-bold group/arrow bg-[#098754] hover:bg-[#087047] text-white"
        >
          {hero.primaryCta.label}
          <Icon
            name="arrow-right"
            class="size-5 ml-2 group-hover/arrow:translate-x-1 transition-transform"
          />
        </Button>

        <Button
          href={hero.secondaryCta.href}
          target="_blank"
          rel="noreferrer"
          variant="secondary"
          class="w-full md:w-auto font-bold transition-colors hover:bg-[#098754] hover:text-white !flex items-center justify-center gap-2"
        >
          <GithubIcon class_="size-5" />
          {hero.secondaryCta.label}
        </Button>
      </div>
    </div>

    <div class="relative group mt-14 w-full max-w-5xl mx-auto px-4 md:px-0">
      <div
        class="absolute -top-6 right-12 w-[90%] h-12 lg:h-[80%] bg-primary/50 blur-3xl rounded-full img-shadow-animation"
      ></div>

      <div
        class="w-full mx-auto rounded-lg relative leading-none flex items-center border border-gray-700 bg-gray-900 p-4 md:p-6 overflow-hidden"
      >
        <div class="w-full">
          <div class="flex items-center mb-4 border-b border-gray-700 pb-2">
            <div class="text-xs md:text-sm font-mono md:whitespace-nowrap">
              <span class="text-cyan-400">➜</span>
              <span class="ml-1" style="color: hsl(341deg 91% 43%);">pypsa-demo</span>
              <span class="text-gray-300 ml-1 md:ml-2">python example.py</span>
            </div>
          </div>
          <div class="text-left font-mono text-xs md:text-sm leading-relaxed">
            <div class="typing-animation" style="--delay: 0.5s;">
              <span style="color: hsl(195deg 63% 44%);">import</span><span class="text-white"
                >&nbsp;pypsa</span
              >
            </div>
            <br />
            <div class="text-gray-500 typing-animation" style="--delay: 1.5s;">
              # Create a new network
            </div>
            <div class="typing-animation" style="--delay: 2s;">
              <span class="text-white">n = pypsa.</span><span style="color: hsl(45deg 100% 50%);"
                >Network</span
              ><span class="text-white">()</span>
            </div>
            <br />
            <div class="text-gray-500 typing-animation" style="--delay: 2.5s;">
              # Add components
            </div>
            <div class="typing-animation" style="--delay: 3s;">
              <span class="text-white">n.add(</span><span style="color: hsl(156deg 86% 28%);"
                >"Bus"</span
              ><span class="text-white">,&nbsp;</span><span style="color: hsl(156deg 86% 28%);"
                >"mybus"</span
              ><span class="text-white">)</span>
            </div>
            <div class="typing-animation" style="--delay: 3.5s;">
              <span class="text-white">n.add(</span><span style="color: hsl(156deg 86% 28%);"
                >"Load"</span
              ><span class="text-white">,&nbsp;</span><span style="color: hsl(156deg 86% 28%);"
                >"myload"</span
              ><span class="text-white">, bus=</span><span style="color: hsl(156deg 86% 28%);"
                >"mybus"</span
              ><span class="text-white">, p_set=</span><span class="text-purple-400">100</span><span
                class="text-white">)</span
              >
            </div>
            <div class="typing-animation" style="--delay: 4s;">
              <span class="text-white">n.add(</span><span style="color: hsl(156deg 86% 28%);"
                >"Generator"</span
              ><span class="text-white">,&nbsp;</span><span style="color: hsl(156deg 86% 28%);"
                >"mygen"</span
              ><span class="text-white">, bus=</span><span style="color: hsl(156deg 86% 28%);"
                >"mybus"</span
              ><span class="text-white">, p_nom=</span><span class="text-purple-400">100</span><span
                class="text-white">, marginal_cost=</span
              ><span class="text-purple-400">20</span><span class="text-white">)</span>
            </div>
            <br />
            <div class="text-gray-500 typing-animation" style="--delay: 4.5s;">
              # Optimize the network
            </div>
            <div class="typing-animation" style="--delay: 5s;">
              <span class="text-white">n.</span><span style="color: hsl(45deg 100% 50%);"
                >optimize</span
              ><span class="text-white">()</span>
            </div>
            <br />
            <div class="text-gray-500 typing-animation" style="--delay: 5.5s;">
              # Get statistics
            </div>
            <div class="typing-animation" style="--delay: 6s;">
              <span class="text-white">n.</span><span style="color: hsl(45deg 100% 50%);"
                >statistics</span
              ><span class="text-white">()</span>
            </div>
            <div class="typing-animation" style="--delay: 6.5s;">
              <span class="text-white">n.statistics.</span><span style="color: hsl(45deg 100% 50%);"
                >energy_balance</span
              ><span class="text-white">()</span>
            </div>
            <br />
            <div class="text-gray-500 typing-animation" style="--delay: 7s;"># Plot results</div>
            <div class="typing-animation" style="--delay: 7.5s;">
              <span class="text-white">n.</span><span style="color: hsl(45deg 100% 50%);">plot</span
              ><span class="text-white">()</span>
            </div>
            <div class="typing-animation" style="--delay: 8s;">
              <span class="text-white">n.</span><span style="color: hsl(45deg 100% 50%);"
                >explore</span
              ><span class="text-white">()</span>
            </div>
            <br />
            <div class="text-gray-500 typing-animation" style="--delay: 8.5s;">
              # Start your journey here <span class="dots-animation"
                ><span>.</span><span>.</span><span>.</span></span
              >
            </div>
          </div>
        </div>
      </div>

      <div
        class="absolute -bottom-6 right-12 w-[90%] h-12 lg:h-[80%] bg-primary/50 blur-3xl rounded-full img-shadow-animation -z-10"
      ></div>
    </div>
  </div>
</section>

<style>
  /* Custom scrollbar for mobile */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    height: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    .custom-scrollbar::-webkit-scrollbar {
      height: 2px;
    }
  }

  .img-shadow-animation {
    animation-name: img-shadow-animation;
    animation-iteration-count: infinite;
    animation-duration: 2s;
    animation-timing-function: ease-in-out;
    animation-direction: alternate;
  }

  .img-border-animation {
    animation-name: img-border-animation;
    animation-iteration-count: infinite;
    animation-duration: 2s;
    animation-timing-function: linear;
    animation-direction: alternate;
  }

  @keyframes img-shadow-animation {
    from {
      opacity: 0.3;
    }

    to {
      opacity: 0.8;
    }
  }

  .typing-animation {
    opacity: 0;
    animation: typing-fade-in 1s forwards;
    animation-delay: var(--delay, 0s);
    white-space: nowrap;
    overflow: hidden;
    display: block;
  }

  @media (max-width: 768px) {
    .typing-animation {
      white-space: normal;
      word-break: break-word;
      animation: mobile-fade-in 0.5s forwards;
      animation-delay: var(--delay, 0s);
    }
  }

  @keyframes typing-fade-in {
    0% {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }
    1% {
      opacity: 1;
    }
    100% {
      opacity: 1;
      width: 100%;
    }
  }

  @keyframes mobile-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes img-border-animation {
    from {
      @apply border-t-primary/10;
    }

    to {
      @apply border-t-primary/60;
    }
  }

  .blinking-cursor {
    color: #10b981;
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%,
    49% {
      opacity: 1;
    }
    50%,
    100% {
      opacity: 0;
    }
  }

  .dots-animation span:nth-child(1) {
    animation: dot-1 2s infinite;
  }

  .dots-animation span:nth-child(2) {
    animation: dot-2 2s infinite;
  }

  .dots-animation span:nth-child(3) {
    animation: dot-3 2s infinite;
  }

  @keyframes dot-1 {
    0%,
    25% {
      opacity: 0;
    }
    26%,
    100% {
      opacity: 1;
    }
  }

  @keyframes dot-2 {
    0%,
    50% {
      opacity: 0;
    }
    51%,
    100% {
      opacity: 1;
    }
  }

  @keyframes dot-3 {
    0%,
    75% {
      opacity: 0;
    }
    76%,
    100% {
      opacity: 1;
    }
  }
</style>
