import type { SearchResult } from '../search/search.js'

/**
 * Whether two results cover the same range.
 */
export function sameResult(first: SearchResult, second: SearchResult): boolean {
  return first.from === second.from && first.to === second.to
}
