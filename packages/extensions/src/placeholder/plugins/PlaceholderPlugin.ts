import type { Editor } from '@tiptap/core'
import { type EditorState, Plugin } from '@tiptap/pm/state'
import { DecorationSet } from '@tiptap/pm/view'

import { DEFAULT_DATA_ATTRIBUTE, PLUGIN_KEY } from '../constants.js'
import { placeholderSettingsPluginKey } from '../placeholderSettingsPluginKey.js'
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

  const getOptions = (state: EditorState): PlaceholderOptions => ({
    ...options,
    placeholder: placeholderSettingsPluginKey.getState(state) ?? options.placeholder,
  })

  const useResolvedPath = options.showOnlyCurrent && !options.includeChildren

  return new Plugin({
    key: PLUGIN_KEY,
    ...(useResolvedPath
      ? {}
      : {
          state: createPlaceholderStateField({
            editor,
            options,
            dataAttribute,
            getOptions: state => ({ ...getOptions(state), showOnlyWhenEditable: false }),
          }),
        }),
    props: {
      decorations: useResolvedPath
        ? state =>
            buildPlaceholderDecorations({
              editor,
              options: getOptions(state),
              dataAttribute,
              doc: state.doc,
              selection: state.selection,
            })
        : state => {
            if (options.showOnlyWhenEditable && !editor.isEditable) {
              return DecorationSet.empty
            }

            return PLUGIN_KEY.getState(state) ?? DecorationSet.empty
          },
    },
  })
}
