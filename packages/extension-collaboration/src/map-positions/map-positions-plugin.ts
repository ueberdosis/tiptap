import type { Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ySyncPluginKey } from '@tiptap/y-tiptap'
import * as Y from 'yjs'

/**
 * The plugin stores the snapshots of the Y.js state before and after the
 * transaction has been applied. This information is used to map the positions
 * of the document before and after the transaction has been applied. It uses a
 * WeakMap so that the snapshots are garbage collected when the transaction is
 * no longer referenced.
 */
export interface MapPositionsPluginState {
  transactionMap: WeakMap<
    Transaction,
    {
      updateBefore: Uint8Array
      updateAfter: Uint8Array
    }
  >
  previousUpdate: Uint8Array
}

export const mapPositionsPluginKey = new PluginKey<MapPositionsPluginState>('mapPositions')

export function mapPositionsPlugin() {
  return new Plugin<MapPositionsPluginState>({
    key: mapPositionsPluginKey,
    state: {
      init: (_config, editorState) => {
        const yState = ySyncPluginKey.getState(editorState)
        return {
          transactionMap: new WeakMap(),
          previousUpdate: Y.encodeStateAsUpdate(yState.doc),
        }
      },
      apply(transaction, pluginState, _oldState, newState) {
        const yState = ySyncPluginKey.getState(newState)
        const updateAfter = Y.encodeStateAsUpdate(yState.doc)
        // Store snapshots of the Y.js state before and after the transaction has been applied
        return {
          transactionMap: pluginState.transactionMap.set(transaction, {
            updateBefore: pluginState.previousUpdate,
            updateAfter,
          }),
          previousUpdate: updateAfter,
        }
      },
    },
  })
}
