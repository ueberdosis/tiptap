import type { EditorState, Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface MapPositionsPluginState {
  transactionMap: WeakMap<
    Transaction,
    {
      oldState: EditorState
      newState: EditorState
    }
  >
}

export const mapPositionsPluginKey = new PluginKey<MapPositionsPluginState>('mapPositions')

export function mapPositionsPlugin() {
  return new Plugin<MapPositionsPluginState>({
    key: mapPositionsPluginKey,
    state: {
      init: () => {
        return {
          transactionMap: new WeakMap(),
        }
      },
      apply(transaction, pluginState, oldState, newState) {
        return {
          transactionMap: pluginState.transactionMap.set(transaction, {
            oldState,
            newState,
          }),
        }
      },
    },
  })
}
