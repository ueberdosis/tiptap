import type { TextblockSearchTarget } from '../search/search.js'

export interface TextblockRange extends TextblockSearchTarget {
  from: number
  to: number
}

export interface IndexedResult {
  result: import('../search/search.js').SearchResult
  index: number
}
