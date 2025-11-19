import type { Editor, MapPositionFromTransactionResult } from '@tiptap/core'
import type { Transaction } from '@tiptap/pm/state'
import { absolutePositionToRelativePosition, relativePositionToAbsolutePosition } from '@tiptap/y-tiptap'

import { isChangeOrigin } from '../helpers/isChangeOrigin.js'
import { mapPositionsPluginKey } from './map-positions-plugin.js'

export function mapPositionFromTransaction(
  position: number,
  transaction: Transaction,
  editor: Editor,
): MapPositionFromTransactionResult {
  const transactionMap = mapPositionsPluginKey.getState(editor.state)?.transactionMap
  const editorStates = transactionMap?.get(transaction)

  if (!isChangeOrigin(transaction) || !editorStates) {
    const mapResult = transaction.mapping.mapResult(position)
    return {
      position: mapResult.pos,
      mapResult,
    }
  }

  const { previousYState, newYState } = editorStates
  // Use the previous Y.js state to get the relative position
  const relativePosition = absolutePositionToRelativePosition(
    position,
    previousYState.type,
    previousYState.binding.mapping,
  )
  // Use the new Y.js state to get the absolute position
  const absolutePosition =
    relativePositionToAbsolutePosition(newYState.doc, newYState.type, relativePosition, newYState.binding.mapping) || 0

  return {
    position: absolutePosition,
    mapResult: null,
  }
}
