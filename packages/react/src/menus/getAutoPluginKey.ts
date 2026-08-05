import { PluginKey } from '@tiptap/pm/state'

/**
 * Build a plugin key for a menu that was not given one, so several menus can coexist.
 */
export function getAutoPluginKey(pluginKey: PluginKey | string | undefined, defaultName: string) {
  return pluginKey ?? new PluginKey(defaultName)
}
