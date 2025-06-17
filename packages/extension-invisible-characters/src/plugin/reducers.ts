import type { PluginState } from '../types.js'

export const stateReducer = (state: PluginState, visible: boolean): PluginState => {
  if (visible === undefined) {
    return state
  }

  return { ...state, visible }
}

export default stateReducer
