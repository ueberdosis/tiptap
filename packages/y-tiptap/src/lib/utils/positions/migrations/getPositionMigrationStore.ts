import type { PositionMigration } from '../../../../types/PositionMigration.js'
import * as Y from 'yjs'

export const getPositionMigrationStore = (fragment: Y.XmlFragment) => {
  if (!fragment.doc) {
    throw new Error('The Yjs fragment must belong to a document')
  }

  const key = fragment._item
    ? `item:${fragment._item.id.client}:${fragment._item.id.clock}`
    : `root:${Y.findRootTypeKey(fragment)}`

  return fragment.doc.getMap<PositionMigration>(`__tiptap_position_migrations:${key}`)
}
