import * as Y from 'yjs'

/** Reports whether a Yjs item is visible in the current document or a snapshot. */
export const isVisible = (item: Y.Item, snapshot?: Y.Snapshot) =>
  snapshot === undefined
    ? !item.deleted
    : snapshot.sv.has(item.id.client) &&
      (snapshot.sv.get(item.id.client) ?? 0) > item.id.clock &&
      !Y.isDeleted(snapshot.ds, item.id)
