import { PluginKey } from '@tiptap/pm/state'

export function getAutoPluginKey(pluginKey: PluginKey | string | undefined, defaultName: string) {
  return pluginKey ?? new PluginKey(defaultName)
}
