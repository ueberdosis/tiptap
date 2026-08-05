/**
 * Clamp a number between a lower and an upper bound.
 */
export function minMax(value = 0, min = 0, max = 0): number {
  return Math.min(Math.max(value, min), max)
}
