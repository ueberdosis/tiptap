import type { EditorState } from 'prosemirror-state'
import type { UndoPluginState } from '../../types/UndoPluginState.js'
import { yUndoPluginKey } from './keys.js'

export function getUndoPluginState(state: EditorState): UndoPluginState {
  const pluginState = yUndoPluginKey.getState(state)
  if (!pluginState) throw new Error('The editor requires yUndoPlugin')
  return pluginState
}
