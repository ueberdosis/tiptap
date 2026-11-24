import type { Node as PMNode } from '@tiptap/pm/model'
import type { Mapping } from '@tiptap/pm/transform'

import type { FindAndReplaceMeta, FindAndReplacePluginState } from '../plugin/plugin-state.js'
import { searchDocument } from '../search/search.js'

import { createDecorations } from './createDecorations.js'
import { getPreviousCurrentResult } from './getPreviousCurrentResult.js'
import { hasCurrentIndex } from './hasCurrentIndex.js'
import { isNewSearch } from './isNewSearch.js'
import { keepsVisitedResult } from './keepsVisitedResult.js'
import { mapResult } from './mapResult.js'
import { resolveCurrentIndex } from './resolveCurrentIndex.js'

export function refreshState(
  previousState: FindAndReplacePluginState,
  state: FindAndReplacePluginState,
  doc: PMNode,
  meta: FindAndReplaceMeta | undefined,
  docChanged: boolean,
  mapping: Mapping | undefined,
): FindAndReplacePluginState {
  const results = searchDocument(doc, state.searchTerm, state)
  const currentIndex = resolveCurrentIndex(previousState, results, meta, docChanged, mapping)
  const current = currentIndex === null ? null : results[currentIndex]
  const previousResult = getPreviousCurrentResult(previousState) ?? null
  const previousCurrent =
    previousResult && mapping ? mapResult(previousResult, mapping) : previousResult

  return {
    ...state,
    results,
    currentIndex,
    currentResultVisited:
      hasCurrentIndex(meta) ||
      (!isNewSearch(meta) && keepsVisitedResult(previousState, current, previousCurrent)),
    decorations: createDecorations(doc, results, currentIndex),
  }
}
