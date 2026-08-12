import type { Editor } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { DecorationSet } from '@tiptap/pm/view'

import { DEFAULT_DATA_ATTRIBUTE, PLUGIN_KEY } from '../constants.js'
import type { PlaceholderOptions } from '../types.js'
import { buildPlaceholderDecorations } from '../utils/buildPlaceholderDecorations.js'
import { createPlaceholderStateField } from '../utils/placeholderStateField.js'
import { preparePlaceholderAttribute } from '../utils/preparePlaceholderAttribute.js'

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

  const useResolvedPath = options.showOnlyCurrent && !options.includeChildren

  return new Plugin({
    key: PLUGIN_KEY,
    ...(useResolvedPath
      ? {}
      : {
          state: createPlaceholderStateField({ editor, options, dataAttribute }),
        }),
    props: {
      decorations: useResolvedPath
        ? ({ doc, selection }) =>
            buildPlaceholderDecorations({ editor, options, dataAttribute, doc, selection })
        : state => {
            if (options.showOnlyWhenEditable && !editor.isEditable) {
              return DecorationSet.empty
            }

            return PLUGIN_KEY.getState(state) ?? DecorationSet.empty
          },
    },
  })
}
