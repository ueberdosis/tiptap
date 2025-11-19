import type { Editor, GetUpdatedRangeResult, Range } from '@tiptap/core'
import type { Transaction } from '@tiptap/pm/state'

import { mapPositionFromTransaction } from './map-position-from-transaction.js'

export interface MapRangeFromTransactionOptions {
  /**
   * The position to map.
   */
  range: Range
  /**
   * The transaction
   */
  transaction: Transaction
  /**
   * The editor instance.
   */
  editor: Editor
  /**
   * The name of the field, defined in the collaboration extension,
   * that identifies the document in the Y.js document.
   */
  field: string
}

export function mapRangeFromTransaction(options: MapRangeFromTransactionOptions): GetUpdatedRangeResult {
  const fromResult = mapPositionFromTransaction({ ...options, position: options.range.from })
  const toResult = mapPositionFromTransaction({ ...options, position: options.range.to })
  return {
    range: {
      from: fromResult.position,
      to: toResult.position,
    },
    mapResultFrom: fromResult.mapResult,
    mapResultTo: toResult.mapResult,
  }
}
