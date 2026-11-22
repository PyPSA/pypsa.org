// Pure log slider math, free of survey-core.
export interface LogRange {
  min: number;
  max: number;
}

/** Slider position in [0, 1] to a whole number between `min` and `max`, log-spaced. */
export function logToValue(pos: number, { min, max }: LogRange): number {
  const p = Math.min(1, Math.max(0, pos));
  return Math.round(min * Math.pow(max / min, p));
}

/** Number to slider position in [0, 1], values outside the range pin to an end. */
export function valueToLog(value: number, { min, max }: LogRange): number {
  if (!Number.isFinite(value) || value <= min) return 0;
  if (value >= max) return 1;
  return Math.log(value / min) / Math.log(max / min);
}

export const NOTCHES_PER_DECADE = 20;

/**
 * Value after moving `notches` log-scale notches (20 per decade), clamped, where a value below `min` counts as one notch under it.
 */
export function logStep(value: number, { min, max }: LogRange, notches: number): number {
  const below = !Number.isFinite(value) || value < min;
  const start = below ? -1 / NOTCHES_PER_DECADE : Math.log10(Math.min(value, max) / min);
  const next = Math.round(min * Math.pow(10, start + notches / NOTCHES_PER_DECADE));
  let result = Math.min(max, Math.max(min, next));
  if (!below && notches > 0 && result <= value) result = Math.min(max, value + 1);
  if (!below && notches < 0 && result >= value) result = Math.max(min, value - 1);
  return result;
}
