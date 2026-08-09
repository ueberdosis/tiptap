import type { Node } from '@tiptap/pm/model'
import type { Mapping } from '@tiptap/pm/transform'

import type { FindAndReplaceMeta, FindAndReplacePluginState } from '../plugin/plugin-state.js'

import { hasCurrentIndex } from './hasCurrentIndex.js'
import { refreshCurrentIndexState } from './refreshCurrentIndexState.js'
import { refreshDocumentState } from './refreshDocumentState.js'
import { refreshState } from './refreshState.js'
import { touchesSearch } from './touchesSearch.js'

export function updateState(
  previousState: FindAndReplacePluginState,
  state: FindAndReplacePluginState,
  doc: Node,
  meta: FindAndReplaceMeta | undefined,
  docChanged: boolean,
  mapping: Mapping,
): FindAndReplacePluginState {
  if (touchesSearch(meta)) {
    return refreshState(previousState, state, doc, meta, docChanged, mapping)
  }

  if (docChanged) {
    return refreshDocumentState(previousState, state, doc, meta, mapping)
  }

  if (hasCurrentIndex(meta)) {
    return refreshCurrentIndexState(previousState, state, doc, meta)
  }

  return state
}
