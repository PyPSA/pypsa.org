// Inline script setting the survey html attributes before first paint, free of survey-core.
import type { WaveDefinition } from "./wave";

/** localStorage key that records a dismissed banner for a wave. */
export const bannerKey = (wave: string) => `pypsa-survey-banner:${wave}`;

export function prepaintScript(def: Pick<WaveDefinition, "wave" | "opens" | "closes">): string {
  const opens = Date.parse(def.opens);
  const closes = Date.parse(def.closes);
  const key = JSON.stringify(bannerKey(def.wave));
  return `(function(){var n=Date.now(),d=false;try{d=localStorage.getItem(${key})!==null}catch(e){}var h=document.documentElement;h.setAttribute("data-survey-open",String(n>=${opens}&&n<${closes}));h.setAttribute("data-survey-dismissed",String(d))})();`;
}
