import type { FindAndReplacePluginState } from '../plugin/plugin-state.js'
import type { SearchResult } from '../search/search.js'

export function getPreviousCurrentResult(
  previousState: FindAndReplacePluginState,
): SearchResult | undefined {
  return previousState.currentIndex === null
    ? undefined
    : previousState.results[previousState.currentIndex]
}
