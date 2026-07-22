import type { SearchResult } from '../search.js'

import { shouldRefreshResult } from './shouldRefreshResult.js'
import type { IndexedResult, TextblockRange } from './types.js'

export function getResultsToRefresh(
  results: SearchResult[],
  textblocks: readonly TextblockRange[],
  previousCurrent: SearchResult | null,
  currentIndex: number | null,
): IndexedResult[] {
  const current = currentIndex === null ? null : (results[currentIndex] ?? null)
  const refreshedResults: IndexedResult[] = []

  results.forEach((result, index) => {
    if (shouldRefreshResult(result, textblocks, previousCurrent, current)) {
      refreshedResults.push({ result, index })
    }
  })

  return refreshedResults
}
