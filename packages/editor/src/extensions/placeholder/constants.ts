import { PluginKey } from 'prosemirror-state'
import type { DecorationSet } from 'prosemirror-view'

/** The default data attribute label */
export const DEFAULT_DATA_ATTRIBUTE = 'placeholder'

/** The plugin key used to store and read the placeholder decoration set */
export const PLUGIN_KEY = new PluginKey<DecorationSet>('tiptap__placeholder')
