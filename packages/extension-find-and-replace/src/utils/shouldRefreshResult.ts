import type { SearchResult } from '../search.js'

import { isCurrentResult } from './isCurrentResult.js'
import { resultInTextblocks } from './resultInTextblocks.js'
import type { TextblockRange } from './types.js'

export function shouldRefreshResult(
  result: SearchResult,
  textblocks: readonly TextblockRange[],
  previousCurrent: SearchResult | null,
  current: SearchResult | null,
): boolean {
  return (
    resultInTextblocks(result, textblocks) ||
    isCurrentResult(result, previousCurrent) ||
    isCurrentResult(result, current)
  )
}
