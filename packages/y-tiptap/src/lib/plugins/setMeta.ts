import type { EditorView } from 'prosemirror-view'
import type { MetaKey } from '../../types/MetaKey.js'
import type { PendingMeta } from '../../types/PendingMeta.js'
import { timeout } from 'lib0/eventloop'
import { ySyncPluginKey } from './keys.js'

let viewsToUpdate: Map<EditorView, Map<MetaKey, unknown>> | null = null

function takePendingMetas(): PendingMeta[] {
  const pending = viewsToUpdate
  viewsToUpdate = null
  const entries: PendingMeta[] = []
  pending?.forEach((metas, view) => {
    metas.forEach((value, key) => entries.push({ view, key, value }))
  })
  return entries
}

function updateMetas(entries = takePendingMetas(), isRetry = false): void {
  let isFirst = true
  while (entries.length > 0) {
    const { view, key, value } = entries[0]
    try {
      const syncState = ySyncPluginKey.getState(view.state)
      if (syncState && syncState.binding.prosemirrorView !== null) {
        view.dispatch(view.state.tr.setMeta(key, value))
      }
    } catch (error) {
      if (!(error instanceof RangeError)) throw error
      // Drop a repeatedly stale entry so the remaining updates can run.
      if (isRetry && isFirst) entries.shift()
      if (entries.length > 0) timeout(0, () => updateMetas(entries, true))
      return
    }
    isFirst = false
    entries.shift()
  }
}

/** Queues plugin metadata and batches repeated updates for the same key. */
export function setMeta(view: EditorView, key: MetaKey, value: unknown): void {
  if (viewsToUpdate === null) {
    viewsToUpdate = new Map()
    timeout(0, updateMetas)
  }
  let metas = viewsToUpdate.get(view)
  if (!metas) {
    metas = new Map()
    viewsToUpdate.set(view, metas)
  }
  metas.set(key, value)
}
