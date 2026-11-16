<script lang="ts">
  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "$lib/components/ui/accordion";

  import { FAQList, faqSection } from "$lib/data/home/faq";
</script>

<section id="faq" class="container md:w-[700px] py-24 sm:py-32">
  <div class="text-center mb-8">
    <h2 class="text-lg text-center mb-2 tracking-wider" style="color: var(--brand-blue-text);">
      {faqSection.eyebrow}
    </h2>
    <h2 class="text-3xl md:text-4xl text-center font-bold">{faqSection.heading}</h2>
  </div>

  <Accordion type="single" class="w-full">
    {#each FAQList as { question, answer, value } (value)}
      <AccordionItem {value}>
        <AccordionTrigger class="text-left">
          {question}
        </AccordionTrigger>
        <AccordionContent>
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html answer}
        </AccordionContent>
      </AccordionItem>
    {/each}
  </Accordion>

  <h3 class="font-medium mt-4">
    {faqSection.moreLabel}
    <a
      href={faqSection.moreLinkHref}
      target="_blank"
      rel="noreferrer"
      class="underline underline-offset-2"
      style="color: var(--brand-blue-text);"
    >
      {faqSection.moreLinkLabel}
    </a>
  </h3>
</section>
