import type { Node } from '@tiptap/pm/model'
import type { Mapping } from '@tiptap/pm/transform'

import type { FindAndReplaceMeta, FindAndReplacePluginState } from '../plugin/plugin-state.js'
import { searchDocument } from '../search/search.js'

import { createDecorations } from './createDecorations.js'
import { resolveCurrentIndex } from './resolveCurrentIndex.js'

export function refreshState(
  previousState: FindAndReplacePluginState,
  state: FindAndReplacePluginState,
  doc: Node,
  meta: FindAndReplaceMeta | undefined,
  docChanged: boolean,
  mapping: Mapping | undefined,
): FindAndReplacePluginState {
  const results = searchDocument(doc, state.searchTerm, state)
  const currentIndex = resolveCurrentIndex(previousState, results, meta, docChanged, mapping)

  return {
    ...state,
    results,
    currentIndex,
    decorations: createDecorations(doc, results, currentIndex),
  }
}
