/**
 * Every homepage icon is defined once here and rendered as a hidden `<svg>` of `<symbol>`s in the root layout.
 */
import {
  mdiPowerPlugBatteryOutline,
  mdiTransmissionTower,
  mdiSecurity,
  mdiCrane,
  mdiRoad,
  mdiRollerblade,
  mdiCrosshairsQuestion,
  mdiDiversify,
  mdiBankOutline,
  mdiScrewdriver,
  mdiDotsSquare,
  mdiHeatPump,
  mdiLightbulb,
  mdiViewModule,
  mdiCarCruiseControl,
  mdiGridLarge,
  mdiDataMatrix,
  mdiRunFast,
  mdiNotebook,
  mdiLockOpen,
  mdiYoutube,
  mdiMastodon,
} from "@mdi/js";

export interface IconDef {
  viewBox: string;
  /** Presentation attributes set on the `<symbol>`. */
  attrs?: string;
  /** Inner SVG markup. */
  body: string;
  /** Default `width`/`height` attributes of the outer `<svg>`. */
  size?: number;
  /** Whether the outer `<svg>` gets `aria-hidden="true"` by default. */
  hidden?: boolean;
}

const LUCIDE_ATTRS =
  'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

const lucide = (body: string): IconDef => ({
  viewBox: "0 0 24 24",
  attrs: LUCIDE_ATTRS,
  body,
  size: 24,
  hidden: true,
});

const filled = (path: string, size?: number): IconDef => ({
  viewBox: "0 0 24 24",
  body: `<path d="${path}" fill="currentColor"/>`,
  size,
});

const brand = (viewBox: string, path: string): IconDef => ({
  viewBox,
  body: `<path d="${path}" style="fill: currentColor !important;"/>`,
});

/** Material Design icons by `@mdi/js` export name. */
const mdiIcons: Record<string, string> = {
  mdiPowerPlugBatteryOutline,
  mdiTransmissionTower,
  mdiSecurity,
  mdiCrane,
  mdiRoad,
  mdiRollerblade,
  mdiCrosshairsQuestion,
  mdiDiversify,
  mdiBankOutline,
  mdiScrewdriver,
  mdiDotsSquare,
  mdiHeatPump,
  mdiLightbulb,
  mdiViewModule,
  mdiCarCruiseControl,
  mdiGridLarge,
  mdiDataMatrix,
  mdiRunFast,
  mdiNotebook,
  mdiLockOpen,
  mdiYoutube,
  mdiMastodon,
};

export const icons: Record<string, IconDef> = {
  "arrow-right": lucide('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),
  "arrow-left": lucide('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>'),
  "book-open": lucide(
    '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>'
  ),
  globe: lucide(
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'
  ),
  map: lucide(
    '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>'
  ),
  "chart-column": lucide(
    '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>'
  ),
  menu: lucide('<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>'),
  "external-link": lucide(
    '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'
  ),
  github: {
    ...brand(
      "0 0 512 512",
      "M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9a17.56 17.56 0 003.8.4c8.3 0 11.5-6.1 11.5-11.4 0-5.5-.2-19.9-.3-39.1a102.4 102.4 0 01-22.6 2.7c-43.1 0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8 11.2 19.6 26.2 25.1 39.6 25.1a63 63 0 0025.6-6c2-14.8 7.8-24.9 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8a18.64 18.64 0 015-.5c8.1 0 26.4 3.1 56.6 24.1a208.21 208.21 0 01112.2 0c30.2-21 48.5-24.1 56.6-24.1a18.64 18.64 0 015 .5c12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3.1 11.5 11.4 11.5a19.35 19.35 0 004-.4C415.9 449.2 480 363.1 480 261.7 480 134.9 379.7 32 256 32z"
    ),
    size: 20,
  },
  linkedin: {
    ...brand(
      "0 0 512 512",
      "M444.17 32H70.28C49.85 32 32 46.7 32 66.89v374.72C32 461.91 49.85 480 70.28 480h373.78c20.54 0 35.94-18.21 35.94-38.39V66.89C480.12 46.7 464.6 32 444.17 32zm-273.3 373.43h-64.18V205.88h64.18zM141 175.54h-.46c-20.54 0-33.84-15.29-33.84-34.43 0-19.49 13.65-34.42 34.65-34.42s33.85 14.82 34.31 34.42c-.01 19.14-13.31 34.43-34.66 34.43zm264.43 229.89h-64.18V296.32c0-26.14-9.34-44-32.56-44-17.74 0-28.24 12-32.91 23.69-1.75 4.2-2.22 9.92-2.22 15.76v113.66h-64.18V205.88h64.18v27.77c9.34-13.3 23.93-32.44 57.88-32.44 42.13 0 74 27.77 74 87.64z"
    ),
    size: 20,
  },
  bluesky: {
    ...brand(
      "0 0 24 24",
      "M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026"
    ),
    size: 20,
  },
  discord: brand(
    "0 0 24 24",
    "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"
  ),
  ...Object.fromEntries(
    Object.entries(mdiIcons).map(([name, path]) => [mdiId(name), filled(path, 24)])
  ),
};

function mdiId(name: string): string {
  return name
    .replace(/^mdi/, "mdi-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

/** Sprite symbol name for an `@mdi/js` path, or `undefined` if it is not in the sprite. */
export function mdiIconName(path: string): string | undefined {
  const entry = Object.entries(mdiIcons).find(([, p]) => p === path);
  return entry ? mdiId(entry[0]) : undefined;
}

/** Markup of the `<symbol>`s, inserted into the hidden sprite `<svg>` in the root layout. */
export const spriteMarkup = Object.entries(icons)
  .map(
    ([name, { viewBox, attrs, body }]) =>
      `<symbol id="i-${name}" viewBox="${viewBox}"${attrs ? " " + attrs : ""}>${body}</symbol>`
  )
  .join("");
