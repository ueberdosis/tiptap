import type { Mapping } from '@tiptap/pm/transform'

import type { FindAndReplaceMeta, FindAndReplacePluginState } from '../plugin/plugin-state.js'
import type { SearchResult } from '../search/search.js'

import { getFallbackCurrentIndex } from './getFallbackCurrentIndex.js'
import { getMappedCurrentIndex } from './getMappedCurrentIndex.js'
import { getPreviousCurrentResult } from './getPreviousCurrentResult.js'
import { isCurrentResult } from './isCurrentResult.js'
import { isNewSearch } from './isNewSearch.js'

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

  return (
    mappedIndex ??
    findPreviousCurrentIndex(previousState, results) ??
    getFallbackCurrentIndex(previousState, results.length)
  )
}

// Stay on the same match when an option adds or removes results before it
function findPreviousCurrentIndex(
  previousState: FindAndReplacePluginState,
  results: SearchResult[],
): number | null {
  const previousCurrent = getPreviousCurrentResult(previousState) ?? null
  const index = results.findIndex(result => isCurrentResult(result, previousCurrent))

  return index === -1 ? null : index
}
