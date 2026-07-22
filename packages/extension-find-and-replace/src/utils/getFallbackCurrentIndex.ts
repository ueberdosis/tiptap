import type { FindAndReplacePluginState } from '../plugin-state.js'

export function getFallbackCurrentIndex(
  previousState: FindAndReplacePluginState,
  length: number,
): number {
  return previousState.currentIndex === null ? 0 : Math.min(previousState.currentIndex, length - 1)
}
