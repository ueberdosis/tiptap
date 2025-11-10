import type { Range } from '@tiptap/core'
import type { EditorState, Transaction } from '@tiptap/pm/state'

import { type YRelativePosition, mapPositionFromTransaction } from './mapPositionFromTransaction.js'

export type YRelativeRange = {
  from: YRelativePosition
  to: YRelativePosition
}

export interface MapRangeFromTransactionOptions {
  transaction: Transaction
  state: EditorState
  range: Range
  yRelativeRange: YRelativeRange
}

export interface MapRangeFromTransactionResult {
  newRange: Range
  newYRelativeRange: YRelativeRange
}

export function mapRangeFromTransaction({
  transaction,
  state,
  range,
  yRelativeRange,
}: MapRangeFromTransactionOptions): MapRangeFromTransactionResult {
  const fromResult = mapPositionFromTransaction({
    transaction,
    state,
    position: range.from,
    yRelativePosition: yRelativeRange.from,
  })
  const toResult = mapPositionFromTransaction({
    transaction,
    state,
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
