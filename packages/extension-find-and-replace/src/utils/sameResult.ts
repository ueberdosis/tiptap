import type { SearchResult } from '../search.js'

export function sameResult(first: SearchResult, second: SearchResult): boolean {
  return first.from === second.from && first.to === second.to
}
