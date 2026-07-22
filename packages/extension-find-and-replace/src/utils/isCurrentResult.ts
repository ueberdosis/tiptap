import type { SearchResult } from '../search.js'

import { sameResult } from './sameResult.js'

export function isCurrentResult(result: SearchResult, current: SearchResult | null): boolean {
  return current !== null && sameResult(result, current)
}
