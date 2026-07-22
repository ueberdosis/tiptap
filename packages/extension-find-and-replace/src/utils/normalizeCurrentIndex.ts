export function normalizeCurrentIndex(
  currentIndex: number | null | undefined,
  length: number,
): number | null {
  if (currentIndex === undefined) {
    return null
  }

  return currentIndex === null ? null : Math.min(currentIndex, length - 1)
}
