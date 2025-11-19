import type { Editor, MapRangeFromTransactionResult, Range } from '@tiptap/core'
import type { Transaction } from '@tiptap/pm/state'

import { mapPositionFromTransaction } from './map-position-from-transaction.js'

export function mapRangeFromTransaction(
  range: Range,
  transaction: Transaction,
  editor: Editor,
  field: string,
): MapRangeFromTransactionResult {
  const fromResult = mapPositionFromTransaction(range.from, transaction, editor, field)
  const toResult = mapPositionFromTransaction(range.to, transaction, editor, field)
  return {
    newRange: {
      from: fromResult.position,
      to: toResult.position,
    },
    mapResultFrom: fromResult.mapResult,
    mapResultTo: toResult.mapResult,
  }
}
