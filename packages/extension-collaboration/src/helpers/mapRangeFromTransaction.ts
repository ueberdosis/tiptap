import type { Range } from '@tiptap/core'
import type { EditorState, Transaction } from '@tiptap/pm/state'

import { mapPositionFromTransaction } from './mapPositionFromTransaction.js'
import { type YRelativePosition } from './yRelativePosition.js'

export interface MapRangeFromTransactionOptions {
  transaction: Transaction
  state: EditorState
  range: Range
  yRelativeRange: YRelativePosition
}

export interface MapRangeFromTransactionResult {
  newRange: Range
  newYRelativeRange: YRelativePosition
}

export function mapRangeFromTransaction({
  range,
  yRelativeRange,
  ...options
}: MapRangeFromTransactionOptions): MapRangeFromTransactionResult {
  const fromResult = mapPositionFromTransaction({
    ...options,
    position: range.from,
    yRelativePosition: yRelativeRange.from,
  })
  const toResult = mapPositionFromTransaction({
    ...options,
    position: range.to,
    yRelativePosition: yRelativeRange.to,
  })
  return {
    newRange: {
      from: fromResult.newPosition,
      to: toResult.newPosition,
    },
    newYRelativeRange: {
      from: fromResult.newYRelativePosition,
      to: toResult.newYRelativePosition,
    },
  }
}
