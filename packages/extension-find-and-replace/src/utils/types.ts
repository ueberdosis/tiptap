import type { TextblockSearchTarget } from '../search.js'

export interface TextblockRange extends TextblockSearchTarget {
  from: number
  to: number
}

export interface IndexedResult {
  result: import('../search.js').SearchResult
  index: number
}
