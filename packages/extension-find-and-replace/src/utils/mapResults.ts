import type { Mapping } from '@tiptap/pm/transform'

import type { SearchResult } from '../search/search.js'

import { mapResult } from './mapResult.js'

/**
 * Move all results through a document change, dropping the deleted ones.
 */
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
