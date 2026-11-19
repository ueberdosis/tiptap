import type { FindAndReplacePluginState } from '../plugin/plugin-state.js'
import type { SearchResult } from '../search/search.js'

import { isCurrentResult } from './isCurrentResult.js'

export function keepsVisitedResult(
  previousState: FindAndReplacePluginState,
  current: SearchResult | null,
  previousCurrent: SearchResult | null,
): boolean {
  return (
    previousState.currentResultVisited &&
    current !== null &&
    isCurrentResult(current, previousCurrent)
  )
}
