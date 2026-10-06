import { PluginKey } from '@tiptap/pm/state'
import type { DecorationSet } from '@tiptap/pm/view'

/** The default data attribute label */
export const DEFAULT_DATA_ATTRIBUTE = 'placeholder'

/** The plugin key used to store and read the placeholder decoration set */
export const PLUGIN_KEY = new PluginKey<DecorationSet>('tiptap__placeholder')
