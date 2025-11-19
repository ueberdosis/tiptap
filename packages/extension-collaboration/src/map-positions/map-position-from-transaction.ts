import type { Editor, MapPositionFromTransactionResult } from '@tiptap/core'
import type { Transaction } from '@tiptap/pm/state'

import { isChangeOrigin } from '../helpers/isChangeOrigin.js'
import { getYAbsolutePosition, getYRelativePosition } from '../helpers/yRelativePosition.js'
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
  const { oldState, newState } = editorStates

  const relativePosition = getYRelativePosition(oldState, position)
  const absolutePosition = getYAbsolutePosition(newState, relativePosition)

  return {
    position: absolutePosition,
    mapResult: null,
  }
}
