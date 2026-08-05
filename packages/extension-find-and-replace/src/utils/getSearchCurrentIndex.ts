import type { Mapping } from '@tiptap/pm/transform'

import type { FindAndReplaceMeta, FindAndReplacePluginState } from '../plugin/plugin-state.js'
import type { SearchResult } from '../search/search.js'

import { getFallbackCurrentIndex } from './getFallbackCurrentIndex.js'
import { getMappedCurrentIndex } from './getMappedCurrentIndex.js'
import { isNewSearch } from './isNewSearch.js'

/**
 * Carry the current index over to the new results. A new search starts back at the first result.
 */
export function getSearchCurrentIndex(
  previousState: FindAndReplacePluginState,
  results: SearchResult[],
  meta: FindAndReplaceMeta | undefined,
  docChanged: boolean,
  mapping: Mapping | undefined,
): number {
  if (isNewSearch(meta)) {
    return 0
  }

  const mappedIndex = getMappedCurrentIndex(previousState, results, docChanged, mapping)

  return mappedIndex ?? getFallbackCurrentIndex(previousState, results.length)
}
