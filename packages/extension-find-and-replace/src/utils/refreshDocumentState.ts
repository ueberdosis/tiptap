import type { Node } from '@tiptap/pm/model'
import type { Mapping } from '@tiptap/pm/transform'

import type { FindAndReplaceMeta, FindAndReplacePluginState } from '../plugin/plugin-state.js'
import { searchTextblocks } from '../search/search.js'

import { getChangedTextblocks } from './getChangedTextblocks.js'
import { mapResult } from './mapResult.js'
import { mapResults } from './mapResults.js'
import { mergeResults } from './mergeResults.js'
import { refreshDecorations } from './refreshDecorations.js'
import { resolveCurrentIndex } from './resolveCurrentIndex.js'
import { resultInTextblocks } from './resultInTextblocks.js'

export function refreshDocumentState(
  previousState: FindAndReplacePluginState,
  state: FindAndReplacePluginState,
  doc: Node,
  meta: FindAndReplaceMeta | undefined,
  mapping: Mapping,
): FindAndReplacePluginState {
  const textblocks = getChangedTextblocks(doc, mapping)
  const mappedResults = mapResults(previousState.results, mapping)
  const unaffectedResults = mappedResults.filter(result => !resultInTextblocks(result, textblocks))
  const changedResults = searchTextblocks(textblocks, state.searchTerm, state)
  const results = mergeResults(unaffectedResults, changedResults)
  const currentIndex = resolveCurrentIndex(previousState, results, meta, true, mapping)
  const previousCurrent =
    previousState.currentIndex === null
      ? null
      : mapResult(previousState.results[previousState.currentIndex], mapping)
  const decorations = previousState.decorations.map(mapping, doc)

  return {
    ...state,
    results,
    currentIndex,
    decorations: refreshDecorations(
      decorations,
      doc,
      results,
      currentIndex,
      textblocks,
      previousCurrent,
    ),
  }
}
