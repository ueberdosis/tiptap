import type { FindAndReplacePluginState } from '../plugin/plugin-state.js'

/**
 * Keep the previous index, clamped to the new result count. Used when the result cannot be followed.
 */
export function getFallbackCurrentIndex(
  previousState: FindAndReplacePluginState,
  length: number,
): number {
  return previousState.currentIndex === null ? 0 : Math.min(previousState.currentIndex, length - 1)
}
