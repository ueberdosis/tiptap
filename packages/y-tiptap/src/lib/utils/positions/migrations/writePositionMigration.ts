import type { PositionMigration, PositionTransfer } from '../../../../types/PositionMigration.js'
import * as Y from 'yjs'
import { mergePositionTransfers } from './mergePositionTransfers.js'

export const writePositionMigration = (
  store: Y.Map<PositionMigration>,
  transfers: PositionTransfer[],
) => {
  const doc = store.doc

  if (!doc || transfers.length === 0) {
    return
  }

  const clock = Y.getState(doc.store, doc.clientID)

  store.set(`${doc.clientID}:${clock}`, {
    version: 1,
    client: doc.clientID,
    clock,
    // Record causal knowledge to distinguish later edits from concurrent destinations.
    seen: [...Y.decodeStateVector(Y.encodeStateVector(doc))],
    transfers: mergePositionTransfers(transfers),
  })
}
