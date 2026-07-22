import type { Node } from '@tiptap/pm/model'
import { DecorationSet } from '@tiptap/pm/view'

import type { SearchResult } from '../search.js'

import { createDecoration } from './createDecoration.js'
import { findDecorations } from './findDecorations.js'
import { getResultsToRefresh } from './getResultsToRefresh.js'
import type { TextblockRange } from './types.js'

export function refreshDecorations(
  decorations: DecorationSet,
  doc: Node,
  results: SearchResult[],
  currentIndex: number | null,
  textblocks: readonly TextblockRange[],
  previousCurrent: SearchResult | null,
): DecorationSet {
  const resultsToRefresh = getResultsToRefresh(results, textblocks, previousCurrent, currentIndex)
  const refreshedResults = resultsToRefresh.map(({ result }) => result)
  const staleResults = previousCurrent ? [...refreshedResults, previousCurrent] : refreshedResults
  const decorationsToRemove = findDecorations(decorations, staleResults, textblocks)
  const decorationsToAdd = resultsToRefresh.map(({ result, index }) => {
    return createDecoration(result, currentIndex, index)
  })

  return decorations.remove(decorationsToRemove).add(doc, decorationsToAdd)
}
