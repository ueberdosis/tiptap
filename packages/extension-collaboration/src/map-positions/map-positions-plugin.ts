import type { Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ySyncPluginKey } from '@tiptap/y-tiptap'
import * as Y from 'yjs'

export interface MapPositionsPluginState {
  transactionMap: WeakMap<
    Transaction,
    {
      updateBefore: Uint8Array
      updateAfter: Uint8Array
    }
  >
  previousUpdate: Uint8Array | null
}

export const mapPositionsPluginKey = new PluginKey<MapPositionsPluginState>('mapPositions')

export function mapPositionsPlugin() {
  return new Plugin<MapPositionsPluginState>({
    key: mapPositionsPluginKey,
    state: {
      init: () => {
        return {
          transactionMap: new WeakMap(),
          previousUpdate: null,
        }
      },
      apply(transaction, pluginState, _oldState, newState) {
        const yState = ySyncPluginKey.getState(newState)
        const previousUpdate = pluginState.previousUpdate
        const updateAfter = Y.encodeStateAsUpdate(yState.doc)
        // Store snapshots of the Y.js state before and after the transaction has been applied
        return {
          transactionMap: pluginState.transactionMap.set(transaction, {
            updateBefore: previousUpdate ?? updateAfter,
            updateAfter,
          }),
          previousUpdate: updateAfter,
        }
      },
    },
  })
}
