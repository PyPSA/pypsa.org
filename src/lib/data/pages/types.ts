/** A link inside running text. Internal links start with `/`. */
export interface PageLink {
  label: string;
  href: string;
}

/** One line of text: plain strings and links, in reading order. */
export type Inline = (string | PageLink)[];

export interface PageSection {
  /** Anchor id. */
  id: string;
  heading: string;
  paragraphs?: Inline[];
  /** Bullet list items, rendered after the paragraphs. */
  items?: Inline[];
}

export interface PageData {
  /** Small label above the title. */
  eyebrow: string;
  title: string;
  /** Short intro under the title. */
  lead: Inline;
  sections: PageSection[];
}
