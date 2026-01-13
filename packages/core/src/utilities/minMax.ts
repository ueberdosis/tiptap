/**
 * Clamps a value between a minimum and maximum bound.
 *
 * @param value - The value to clamp
 * @param min - The minimum bound
 * @param max - The maximum bound
 * @returns The clamped value, guaranteed to be within [min, max]
 *
 * @example
 * minMax(5, 0, 10)  // returns 5
 * minMax(-5, 0, 10) // returns 0
 * minMax(15, 0, 10) // returns 10
 */
export function minMax(value: number, min: number, max: number): number {
  // Handle invalid range where min > max by swapping bounds
  if (min > max) {
    ;[min, max] = [max, min]
  }

  return Math.min(Math.max(value, min), max)
}
