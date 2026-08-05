/**
 * Clamp an index into the result list.
 * @returns `null` when there are no results or no index was given.
 */
export function normalizeCurrentIndex(
  currentIndex: number | null | undefined,
  length: number,
): number | null {
  if (currentIndex === undefined || currentIndex === null || length === 0) {
    return null
  }

  return Math.max(0, Math.min(currentIndex, length - 1))
}
