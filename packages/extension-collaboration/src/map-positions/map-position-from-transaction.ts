import type { Editor, GetUpdatedPositionResult } from '@tiptap/core'
import type { Transaction } from '@tiptap/pm/state'

import { mapPositionsFromTransaction } from './map-positions-from-transaction.js'

export interface MapPositionFromTransactionOptions {
  /**
   * The position to map.
   */
  position: number
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

export function mapPositionFromTransaction({
  position,
  transaction,
  editor,
  field,
}: MapPositionFromTransactionOptions): GetUpdatedPositionResult {
  const results = mapPositionsFromTransaction({
    positions: [position],
    transaction,
    editor,
    field,
  })

  return results[0]
}
