import type { SearchResult } from '../search/search.js'

import { sameResult } from './sameResult.js'

/**
 * Whether a result is the one the user is on.
 */
export function isCurrentResult(result: SearchResult, current: SearchResult | null): boolean {
  return current !== null && sameResult(result, current)
}
