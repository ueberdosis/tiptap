import type { FindAndReplacePluginState } from '../plugin-state.js'
import type { SearchResult } from '../search.js'

export function getPreviousCurrentResult(
  previousState: FindAndReplacePluginState,
): SearchResult | undefined {
  return previousState.currentIndex === null
    ? undefined
    : previousState.results[previousState.currentIndex]
}
