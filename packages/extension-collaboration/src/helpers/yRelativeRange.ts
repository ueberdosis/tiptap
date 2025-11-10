import type { Range, YRelativeRange } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'

import { getYAbsolutePosition, getYRelativePosition } from './yRelativePosition.js'

export function getYAbsoluteRange(state: EditorState, yRelativeRange: YRelativeRange): Range {
  return {
    from: getYAbsolutePosition(state, yRelativeRange.from),
    to: getYAbsolutePosition(state, yRelativeRange.to),
  }
}

export function getYRelativeRange(state: EditorState, absoluteRange: Range): YRelativeRange {
  return {
    from: getYRelativePosition(state, absoluteRange.from),
    to: getYRelativePosition(state, absoluteRange.to),
  }
}
