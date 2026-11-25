import type { Node as PMNode } from '@tiptap/pm/model'
import type { Transform } from '@tiptap/pm/transform'

import type { FindAndReplaceMeta, FindAndReplacePluginState } from '../plugin/plugin-state.js'

import { hasCurrentIndex } from './hasCurrentIndex.js'
import { refreshCurrentIndexState } from './refreshCurrentIndexState.js'
import { refreshDocumentState } from './refreshDocumentState.js'
import { refreshState } from './refreshState.js'
import { touchesSearch } from './touchesSearch.js'

export function updateState(
  previousState: FindAndReplacePluginState,
  state: FindAndReplacePluginState,
  doc: PMNode,
  meta: FindAndReplaceMeta | undefined,
  transform: Transform,
): FindAndReplacePluginState {
  if (touchesSearch(meta)) {
    return refreshState(previousState, state, doc, meta, transform.docChanged, transform.mapping)
  }

  if (transform.docChanged) {
    return refreshDocumentState(previousState, state, doc, meta, transform)
  }

  if (hasCurrentIndex(meta)) {
    return refreshCurrentIndexState(previousState, state, doc, meta)
  }

  return state
}
