import { PluginKey } from '@tiptap/pm/state'

import type { ViewportState } from './types.js'

/** The default data attribute label */
export const DEFAULT_DATA_ATTRIBUTE = 'placeholder'

/** The plugin key used to store and read the placeholder viewport state */
export const PLUGIN_KEY = new PluginKey<ViewportState>('tiptap__placeholder')
