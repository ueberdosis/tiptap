import type { TextblockSearchTarget } from '../search/search.js'

/**
 * A text block together with the range it covers.
 */
export interface TextblockRange extends TextblockSearchTarget {
  from: number
  to: number
}

/**
 * A result together with its place in the result list.
 */
export interface IndexedResult {
  result: import('../search/search.js').SearchResult
  index: number
}
