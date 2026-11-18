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
