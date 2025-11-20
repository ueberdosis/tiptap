import type { Editor, GetUpdatedRangeResult, Range } from '@tiptap/core'
import type { Transaction } from '@tiptap/pm/state'

import { mapPositionsFromTransaction } from './map-positions-from-transaction.js'

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
  const results = mapPositionsFromTransaction({
    ...options,
    positions: [options.range.from, options.range.to],
  })

  const fromResult = results[0]
  const toResult = results[1]

  return {
    range: {
      from: fromResult.position,
      to: toResult.position,
    },
    mapResultFrom: fromResult.mapResult,
    mapResultTo: toResult.mapResult,
  }
}
