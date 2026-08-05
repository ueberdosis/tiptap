import type { PluginState } from '../types.js'

/**
 * Works out the next plugin state from a transaction.
 */
export const stateReducer = (state: PluginState, visible: boolean): PluginState => {
  if (visible === undefined) {
    return state
  }

  return { ...state, visible }
}

export default stateReducer
