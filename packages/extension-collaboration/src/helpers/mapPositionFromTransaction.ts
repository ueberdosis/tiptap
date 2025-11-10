import type { EditorState, Transaction } from '@tiptap/pm/state'
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  ySyncPluginKey,
} from '@tiptap/y-tiptap'

import { isChangeOrigin } from './isChangeOrigin.js'

function getAbsolutePosition(state: EditorState, relativePos: YRelativePosition) {
  const ystate = ySyncPluginKey.getState(state)
  return relativePositionToAbsolutePosition(ystate.doc, ystate.type, relativePos, ystate.binding.mapping) || 0
}

function getRelativePosition(state: EditorState, absolutePos: number): YRelativePosition {
  const ystate = ySyncPluginKey.getState(state)
  return absolutePositionToRelativePosition(absolutePos, ystate.type, ystate.binding.mapping)
}

export type YRelativePosition = any | null

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
      newPosition: getAbsolutePosition(state, yRelativePosition),
      newYRelativePosition: yRelativePosition,
    }
  }

  const newPosition = transaction.mapping.map(position)

  return {
    newPosition,
    newYRelativePosition: newPosition === position ? yRelativePosition : getRelativePosition(state, newPosition),
  }
}
