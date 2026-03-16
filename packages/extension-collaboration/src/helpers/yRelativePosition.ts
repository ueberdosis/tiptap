import type { EditorState } from '@tiptap/pm/state'
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
  // ystate is never null because we've checked it before calling this function
  const ystate = ySyncPluginKey.getState(state)
  return relativePositionToAbsolutePosition(ystate.doc, ystate.type, relativePos, ystate.binding.mapping) || 0
}

/**
 * Converts a position in the Tiptap document to a Y.js relative position.
 */
export function getYRelativePosition(state: EditorState, absolutePos: number): YRelativePosition {
  // ystate is never null because we've checked it before calling this function
  const ystate = ySyncPluginKey.getState(state)
  return absolutePositionToRelativePosition(absolutePos, ystate.type, ystate.binding.mapping)
}
