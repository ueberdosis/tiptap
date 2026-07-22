import type { Mapping } from '@tiptap/pm/transform'

import type { SearchResult } from '../search.js'

import { mapResult } from './mapResult.js'

export function mapResults(results: SearchResult[], mapping: Mapping): SearchResult[] {
  const mappedResults: SearchResult[] = []

  results.forEach(result => {
    const mapped = mapResult(result, mapping)

    if (mapped) {
      mappedResults.push(mapped)
    }
  })

  return mappedResults
}
