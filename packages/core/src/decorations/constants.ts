import { PluginKey } from '@tiptap/pm/state'
import { DecorationManagerState } from './types.js'

export const DECORATION_MANAGER_PLUGIN_KEY_NAME = '__tiptap_decorations__'
export const DECORATION_MANAGER_PLUGIN_KEY = new PluginKey<DecorationManagerState>(
  DECORATION_MANAGER_PLUGIN_KEY_NAME,
)
