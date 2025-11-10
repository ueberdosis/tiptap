import type { EditorState, Transaction } from '@tiptap/pm/state'

import { isChangeOrigin } from './isChangeOrigin.js'
import type { YRelativePosition } from './yRelativePosition.js'
import { getYAbsolutePosition, getYRelativePosition } from './yRelativePosition.js'

export interface MapPositionFromTransactionOptions {
  transaction: Transaction
  state: EditorState
  position: number
  yRelativePosition: YRelativePosition
}

export interface MapPositionFromTransactionResult {
  newPosition: number
  newYRelativePosition: YRelativePosition
}

export function mapPositionFromTransaction({
  transaction,
  state,
  position,
  yRelativePosition,
}: MapPositionFromTransactionOptions): MapPositionFromTransactionResult {
  if (isChangeOrigin(transaction)) {
    return {
      newPosition: getYAbsolutePosition(state, yRelativePosition),
      newYRelativePosition: yRelativePosition,
    }
  }

  const newPosition = transaction.mapping.map(position)

  return {
    newPosition,
    newYRelativePosition: newPosition === position ? yRelativePosition : getYRelativePosition(state, newPosition),
  }
}
