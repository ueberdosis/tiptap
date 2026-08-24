import { PluginKey } from '@tiptap/editor/pm/state'

export function getAutoPluginKey(pluginKey: PluginKey | string | undefined, defaultName: string) {
  return pluginKey ?? new PluginKey(defaultName)
}
