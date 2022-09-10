import { Transaction } from 'prosemirror-state'
import { ySyncPluginKey } from 'y-prosemirror'

export function isChangeOrigin(transaction: Transaction): boolean {
  return !!transaction.getMeta(ySyncPluginKey)
}
