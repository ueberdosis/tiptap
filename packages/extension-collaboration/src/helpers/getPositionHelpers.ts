import type { Editor, PositionHelpers } from '@tiptap/core'

import { mapPositionFromTransaction } from './mapPositionFromTransaction.js'
import { mapRangeFromTransaction } from './mapRangeFromTransaction.js'
import { getYAbsolutePosition, getYRelativePosition } from './yRelativePosition.js'
import { getYAbsoluteRange, getYRelativeRange } from './yRelativeRange.js'

export function getPositionHelpers(editor: Editor): PositionHelpers {
  const { state } = editor
  return {
    mapPositionFromTransaction: options => {
      return mapPositionFromTransaction({
        ...options,
        state,
      })
    },
    mapRangeFromTransaction: options => {
      return mapRangeFromTransaction({
        ...options,
        state,
      })
    },
    getYAbsolutePosition: relativePos => {
      return getYAbsolutePosition(state, relativePos)
    },
    getYRelativePosition: absolutePos => {
      return getYRelativePosition(state, absolutePos)
    },
    getYAbsoluteRange: yRelativeRange => {
      return getYAbsoluteRange(state, yRelativeRange)
    },
    getYRelativeRange: absoluteRange => {
      return getYRelativeRange(state, absoluteRange)
    },
  }
}
