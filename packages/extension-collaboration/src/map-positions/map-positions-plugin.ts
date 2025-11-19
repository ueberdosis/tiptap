import type { Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ySyncPluginKey } from '@tiptap/y-tiptap'

export interface MapPositionsPluginYState {
  type: any
  binding: any
  doc: any
}

export interface MapPositionsPluginState {
  transactionMap: WeakMap<
    Transaction,
    {
      previousYState: MapPositionsPluginYState
      newYState: MapPositionsPluginYState
    }
  >
  previousYState: MapPositionsPluginYState | null
}

export const mapPositionsPluginKey = new PluginKey<MapPositionsPluginState>('mapPositions')

export function mapPositionsPlugin() {
  return new Plugin<MapPositionsPluginState>({
    key: mapPositionsPluginKey,
    state: {
      init: () => {
        return {
          transactionMap: new WeakMap(),
          previousYState: null,
        }
      },
      apply(transaction, pluginState, _oldState, newState) {
        const yState = ySyncPluginKey.getState(newState)
        const previousYState = pluginState.previousYState
        // Store snapshots of the Y.js state before and after the transaction has been applied
        const newYState = {
          type: yState.type,
          binding: yState.binding,
          doc: yState.doc,
        }
        return {
          transactionMap: pluginState.transactionMap.set(transaction, {
            previousYState: previousYState ?? newYState,
            newYState,
          }),
          previousYState: newYState,
        }
      },
    },
  })
}
