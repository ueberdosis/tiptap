import type { FindAndReplacePluginState } from '../plugin/plugin-state.js'
import type { SearchResult } from '../search/search.js'

/**
 * The result the user was on before the last change.
 */
export function getPreviousCurrentResult(
  previousState: FindAndReplacePluginState,
): SearchResult | undefined {
  return previousState.currentIndex === null
    ? undefined
    : previousState.results[previousState.currentIndex]
}
