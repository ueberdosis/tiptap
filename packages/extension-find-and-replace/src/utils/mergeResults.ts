import type { SearchResult } from '../search/search.js'

export function mergeResults(first: SearchResult[], second: SearchResult[]): SearchResult[] {
  const results: SearchResult[] = []
  let firstIndex = 0
  let secondIndex = 0

  while (firstIndex < first.length && secondIndex < second.length) {
    if (first[firstIndex].from < second[secondIndex].from) {
      results.push(first[firstIndex++])
      continue
    }

    results.push(second[secondIndex++])
  }

  return results.concat(first.slice(firstIndex), second.slice(secondIndex))
}
