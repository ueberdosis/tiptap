import { PluginKey } from '@tiptap/pm/state'

import type { ViewportState } from './types.js'

/** The default data attribute label */
export const DEFAULT_DATA_ATTRIBUTE = 'placeholder'

/** The plugin key used to store and read the placeholder viewport state */
export const PLUGIN_KEY = new PluginKey<ViewportState>('tiptap__placeholder')

/**
 * Extra pixels added above and below the visible viewport when computing the
 * range of nodes to decorate. Decorating slightly beyond the fold means a
 * node already has its placeholder before it scrolls into view, which hides
 * the latency introduced by the throttled viewport recompute.
 */
export const VIEWPORT_OVERSCAN_PX = 200
