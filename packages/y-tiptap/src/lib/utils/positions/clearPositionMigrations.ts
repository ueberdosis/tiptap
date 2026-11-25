import type { Doc, Map as YMap, Transaction } from 'yjs'

const migrationPrefix = '__tiptap_position_migrations:'

export const clearPositionMigrations = (document: Doc, transaction?: Transaction) => {
  const stores: YMap<unknown>[] = []

  document.share.forEach((type, name) => {
    if (!name.startsWith(migrationPrefix) || (transaction && !transaction.changed.has(type))) {
      return
    }

    const store = document.getMap(name)
    if (store.size > 0) {
      stores.push(store)
    }
  })

  if (stores.length === 0) {
    return
  }

  document.transact(transaction => {
    transaction.meta.set('addToHistory', false)
    stores.forEach(store => store.clear())
  }, clearPositionMigrations)
}
