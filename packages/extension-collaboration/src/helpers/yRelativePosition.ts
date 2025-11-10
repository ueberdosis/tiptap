import type { YRelativePosition } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  ySyncPluginKey,
} from '@tiptap/y-tiptap'

/**
 * Converts a Y.js relative position to a position in the Tiptap document.
 */
export function getYAbsolutePosition(state: EditorState, relativePos: YRelativePosition) {
  const ystate = ySyncPluginKey.getState(state)
  return relativePositionToAbsolutePosition(ystate.doc, ystate.type, relativePos, ystate.binding.mapping) || 0
}

/**
 * Converts a position in the Tiptap document to a Y.js relative position.
 */
export function getYRelativePosition(state: EditorState, absolutePos: number): YRelativePosition {
  const ystate = ySyncPluginKey.getState(state)
  return absolutePositionToRelativePosition(absolutePos, ystate.type, ystate.binding.mapping)
}
