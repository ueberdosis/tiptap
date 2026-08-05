import type { Mapping } from '@tiptap/pm/transform'

import type { SearchResult } from '../search/search.js'

/**
 * Move a result through a document change.
 * @returns `null` when the text it covered was deleted.
 */
export function mapResult(result: SearchResult, mapping: Mapping): SearchResult | null {
  const from = mapping.map(result.from, 1)
  const to = mapping.map(result.to, -1)

  return from < to ? { from, to } : null
}
