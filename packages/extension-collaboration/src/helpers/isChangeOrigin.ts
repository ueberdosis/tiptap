import { Transaction } from '@tiptap/pm/state'
import { ySyncPluginKey } from 'y-prosemirror'

export function isChangeOrigin(transaction: Transaction): boolean {
  return !!transaction.getMeta(ySyncPluginKey)
}
