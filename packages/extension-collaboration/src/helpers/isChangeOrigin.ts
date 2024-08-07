import { Transaction } from '@tiptap/pm/state'
import { ySyncPluginKey } from 'y-prosemirror'

/**
 * Checks if a transaction was originated from a Yjs change.
 * @param {Transaction} transaction - The transaction to check.
 * @returns {boolean} - True if the transaction was originated from a Yjs change, false otherwise.
 * @example
 * const transaction = new Transaction(doc)
 * const isOrigin = isChangeOrigin(transaction) // returns false
 */
export function isChangeOrigin(transaction: Transaction): boolean {
  return !!transaction.getMeta(ySyncPluginKey)
}
