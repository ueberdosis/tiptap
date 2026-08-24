import type { EditorState } from '@tiptap/editor/pm/state'
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  ySyncPluginKey,
} from '@tiptap/y-tiptap'

/**
 * A type that represents a Y.js relative position. Used to map a position from
 * a transaction, handling both Yjs changes and regular transactions.
 *
 * If the editor is not collaborative, the value can be `null`.
 */
export type YRelativePosition = any

/**
 * Converts a Y.js relative position to a position in the Tiptap document.
 */
export function getYAbsolutePosition(state: EditorState, relativePos: YRelativePosition): number {
  const ystate = ySyncPluginKey.getState(state)

  if (!ystate) {
    return -1
  }

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
  const ystate = ySyncPluginKey.getState(state)

  if (!ystate) {
    return null
  }

  return absolutePositionToRelativePosition(absolutePos, ystate.type, ystate.binding.mapping)
}
