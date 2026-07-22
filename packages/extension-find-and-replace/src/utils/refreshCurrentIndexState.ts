import type { Node } from '@tiptap/pm/model'

import type { FindAndReplaceMeta, FindAndReplacePluginState } from '../plugin-state.js'

import { refreshDecorations } from './refreshDecorations.js'
import { resolveCurrentIndex } from './resolveCurrentIndex.js'

export function refreshCurrentIndexState(
  previousState: FindAndReplacePluginState,
  state: FindAndReplacePluginState,
  doc: Node,
  meta: FindAndReplaceMeta | undefined,
): FindAndReplacePluginState {
  const currentIndex = resolveCurrentIndex(previousState, state.results, meta, false, undefined)
  const previousCurrent =
    previousState.currentIndex === null ? null : previousState.results[previousState.currentIndex]

  return {
    ...state,
    currentIndex,
    decorations: refreshDecorations(
      previousState.decorations,
      doc,
      state.results,
      currentIndex,
      [],
      previousCurrent,
    ),
  }
}
