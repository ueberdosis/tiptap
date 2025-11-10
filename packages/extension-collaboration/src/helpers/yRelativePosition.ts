import type { EditorState } from '@tiptap/pm/state'
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  ySyncPluginKey,
} from '@tiptap/y-tiptap'

export type YRelativePosition = any | null

export function getYAbsolutePosition(state: EditorState, relativePos: YRelativePosition) {
  const ystate = ySyncPluginKey.getState(state)
  return relativePositionToAbsolutePosition(ystate.doc, ystate.type, relativePos, ystate.binding.mapping) || 0
}

export function getYRelativePosition(state: EditorState, absolutePos: number): YRelativePosition {
  const ystate = ySyncPluginKey.getState(state)
  return absolutePositionToRelativePosition(absolutePos, ystate.type, ystate.binding.mapping)
}
