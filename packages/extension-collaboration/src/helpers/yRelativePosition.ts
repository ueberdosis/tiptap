import type { EditorState } from '@tiptap/pm/state'
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  ySyncPluginKey,
} from '@tiptap/y-tiptap'
import type { YRelativePosition } from '../types/YRelativePosition.js'

export type { YRelativePosition } from '../types/YRelativePosition.js'

/**
 * Converts a Y.js relative position to a position in the Tiptap document.
 */
export function getYAbsolutePosition(state: EditorState, relativePos: YRelativePosition): number {
  if (relativePos === null) return 0
  const ystate = getSyncState(state)
  return (
    relativePositionToAbsolutePosition(
      ystate.doc,
      ystate.type,
      relativePos,
      ystate.binding.mapping,
    ) || 0
  )
}

/**
 * Converts a position in the Tiptap document to a Y.js relative position.
 */
export function getYRelativePosition(state: EditorState, absolutePos: number): YRelativePosition {
  const ystate = getSyncState(state)
  return absolutePositionToRelativePosition(absolutePos, ystate.type, ystate.binding.mapping)
}

function getSyncState(state: EditorState) {
  const syncState = ySyncPluginKey.getState(state)
  if (!syncState) throw new Error('Collaboration requires the Yjs sync plugin')
  return syncState
}
