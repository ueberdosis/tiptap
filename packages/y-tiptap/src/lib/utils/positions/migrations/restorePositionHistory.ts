import type { PositionMigration, PositionTransfer } from '../../../../types/PositionMigration.js'
import * as Y from 'yjs'
import { getPositionMigrationStore } from './getPositionMigrationStore.js'
import { getLivePositionTargets } from './getLivePositionTargets.js'
import { writePositionMigration } from './writePositionMigration.js'

const restoreTransfers = (fragment: Y.XmlFragment, store: Y.Map<PositionMigration>) => {
  const doc = fragment.doc

  if (!doc) {
    return
  }

  const live = getLivePositionTargets(fragment)
  const identities = new Map<string, Y.ID>()
  const connections = new Map<string, Set<string>>()
  const connect = (source: Y.ID, target: Y.ID) => {
    const from = `${source.client}:${source.clock}`
    const to = `${target.client}:${target.clock}`
    identities.set(from, source)
    identities.set(to, target)
    const outgoing = connections.get(from) ?? new Set<string>()
    const incoming = connections.get(to) ?? new Set<string>()
    outgoing.add(to)
    incoming.add(from)
    connections.set(from, outgoing)
    connections.set(to, incoming)
  }

  store.forEach(migration =>
    migration.transfers.forEach(({ source, target }) => {
      if (!target || source.boundary) {
        return
      }

      for (let offset = 0; offset < source.length; offset += 1) {
        connect(
          Y.createID(source.client, source.clock + offset),
          Y.createID(target.client, target.clock + offset),
        )
      }
    }),
  )

  // Yjs redone links are local and are absent from encoded updates.
  doc.store.clients.forEach(structs =>
    structs.forEach(item => {
      if (!(item instanceof Y.Item) || !item.redone) {
        return
      }

      if (!(item.content instanceof Y.ContentString) && !(item.content instanceof Y.ContentType)) {
        return
      }

      for (let offset = 0; offset < item.length; offset += 1) {
        connect(
          Y.createID(item.id.client, item.id.clock + offset),
          Y.createID(item.redone.client, item.redone.clock + offset),
        )
      }
    }),
  )

  const transfers: PositionTransfer[] = []
  const visited = new Set<string>()

  connections.forEach((_, start) => {
    if (visited.has(start)) {
      return
    }

    const pending = [start]
    const component: string[] = []
    const targets: NonNullable<PositionTransfer['target']>[] = []

    while (pending.length > 0) {
      const key = pending.pop()!

      if (visited.has(key)) {
        continue
      }

      visited.add(key)
      component.push(key)
      const target = live.get(key)

      if (target) {
        targets.push(target)
      }

      pending.push(...(connections.get(key) ?? []))
    }

    // Multiple live identities do not identify a unique restored destination.
    if (targets.length !== 1) {
      return
    }

    component.forEach(key => {
      if (live.has(key)) {
        return
      }

      const source = identities.get(key)!
      transfers.push({
        source: { client: source.client, clock: source.clock, length: 1 },
        target: targets[0],
      })

      const item = Y.getItem(doc.store, source)

      if (item.content instanceof Y.ContentType && item.content.type instanceof Y.XmlElement) {
        for (const boundary of ['start', 'end'] as const) {
          transfers.push({
            source: { client: source.client, clock: source.clock, length: 1, boundary },
            target: { client: targets[0].client, clock: targets[0].clock, type: null, boundary },
          })
        }
      }
    })
  })

  writePositionMigration(store, transfers)
}

export const restorePositionHistory = (
  fragment: Y.XmlFragment,
  manager: Y.UndoManager,
  action: 'undo' | 'redo',
) => {
  const store = getPositionMigrationStore(fragment)

  if (store.size === 0) {
    return manager[action]()
  }

  const flag = action === 'undo' ? 'undoing' : 'redoing'
  let result: ReturnType<Y.UndoManager['undo']> = null
  const captureStackItem = ({ stackItem }: { stackItem: NonNullable<typeof result> }) => {
    result = stackItem
  }

  manager.on('stack-item-popped', captureStackItem)
  try {
    manager.doc.transact(() => {
      // Yjs 13.6.13 returns null even when it pops a stack item.
      manager[action]()
      // Keep the outer transaction classified as undo or redo through observer cleanup.
      manager[flag] = true
      manager.currStackItem = result

      if (result) {
        restoreTransfers(fragment, store)
      }
    }, manager)
  } finally {
    manager.off('stack-item-popped', captureStackItem)
    manager[flag] = false
    manager.currStackItem = null
  }

  return result
}
