import type { EditorState } from 'prosemirror-state'
import type { SyncPluginState } from '../../types/SyncPluginState.js'
import { ySyncPluginKey } from './keys.js'

export function getSyncPluginState(state: EditorState): SyncPluginState {
  const pluginState = ySyncPluginKey.getState(state)
  if (!pluginState) throw new Error('The editor requires ySyncPlugin')
  return pluginState
}
