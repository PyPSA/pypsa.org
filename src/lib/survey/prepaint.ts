// Inline script setting the survey html attributes before first paint, free of survey-core.
import type { WaveMeta } from "./meta";
import { storageKey } from "./progress";

/** localStorage key that records a dismissed banner for a wave. */
export const bannerKey = (wave: string) => `pypsa-survey-banner:${wave}`;

export function prepaintScript(def: Pick<WaveMeta, "wave" | "opens" | "closes">): string {
  const opens = Date.parse(def.opens);
  const closes = Date.parse(def.closes);
  const key = JSON.stringify(bannerKey(def.wave));
  const progress = JSON.stringify(storageKey(def));
  // Picks the survey state by date, then nostorage when storage throws, then resume when progress exists.
  const state =
    `if(/^\\/survey\\/?$/.test(location.pathname)){var s;` +
    `if(n>=${closes})s="closed";else if(n<${opens})s="before";` +
    `else try{s=localStorage.getItem(${progress})?"resume":"open"}catch(e){s="nostorage"}` +
    `h.setAttribute("data-survey-state",s)}`;
  return `(function(){var n=Date.now(),d=false;try{d=localStorage.getItem(${key})!==null}catch(e){}var h=document.documentElement;h.setAttribute("data-survey-open",String(n>=${opens}&&n<${closes}));h.setAttribute("data-survey-dismissed",String(d));${state}})();`;
}
