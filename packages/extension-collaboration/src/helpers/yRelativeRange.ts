import type { Range } from '@tiptap/core'
import type { EditorState } from 'packages/pm/state/index.js'

import { type YRelativePosition, getYAbsolutePosition, getYRelativePosition } from './yRelativePosition.js'

export interface YRelativeRange {
  from: YRelativePosition
  to: YRelativePosition
}

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
