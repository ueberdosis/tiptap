import * as error from 'lib0/error'
import * as Y from 'yjs'
import { ySyncPluginKey } from '../../plugins/keys.js'

/** Deletes shared content that the editor schema cannot display. */
export const deleteYType = (type: Y.XmlElement | Y.XmlText) => {
  const doc = type.doc
  const item = type._item
  if (!doc || !item) throw error.unexpectedCase()
  doc.transact(transaction => {
    item.delete(transaction)
  }, ySyncPluginKey)
}
