import type { Editor } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'

import { DEFAULT_DATA_ATTRIBUTE, PLUGIN_KEY } from '../constants.js'
import type { PlaceholderOptions } from '../types.js'
import { buildPlaceholderDecorations } from '../utils/buildPlaceholderDecorations.js'
import { preparePlaceholderAttribute } from '../utils/preparePlaceholderAttribute.js'
import { createViewportPluginView, viewportPluginState } from '../utils/viewportTracking.js'

export type CreatePluginOptions = {
  editor: Editor
  options: PlaceholderOptions
}

/**
 * Creates the ProseMirror plugin that renders placeholder decorations.
 * @param options.editor - The editor instance.
 * @param options.options - The resolved placeholder options.
 * @returns The configured placeholder plugin.
 */
export function createPlaceholderPlugin({ editor, options }: CreatePluginOptions) {
  const dataAttribute = options.dataAttribute
    ? `data-${preparePlaceholderAttribute(options.dataAttribute)}`
    : `data-${DEFAULT_DATA_ATTRIBUTE}`

  return new Plugin({
    key: PLUGIN_KEY,
    state: viewportPluginState,
    view: createViewportPluginView,
    props: {
      decorations: ({ doc, selection }) =>
        buildPlaceholderDecorations({ editor, options, dataAttribute, doc, selection }),
    },
  })
}
