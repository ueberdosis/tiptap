import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'

import { DEFAULT_DATA_ATTRIBUTE } from './constants.js'
import { placeholderSettingsPluginKey } from './placeholderSettingsPluginKey.js'
import { createPlaceholderPlugin } from './plugins/PlaceholderPlugin.js'
import type { PlaceholderOptions } from './types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    placeholder: {
      /**
       * Update the placeholder without changing the document.
       * @param placeholder A string or a function returning the placeholder.
       * @returns Whether the command can run.
       * @example editor.commands.setPlaceholder('Write something')
       */
      setPlaceholder: (placeholder: PlaceholderOptions['placeholder']) => ReturnType
    }
  }
}

/**
 * This extension allows you to add a placeholder to your editor.
 * A placeholder is a text that appears when the editor or a node is empty.
 * @see https://www.tiptap.dev/api/extensions/placeholder
 */
export const Placeholder = Extension.create<PlaceholderOptions>({
  name: 'placeholder',

  addOptions() {
    return {
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
      dataAttribute: DEFAULT_DATA_ATTRIBUTE,
      placeholder: 'Write something …',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      includeChildren: false,
    }
  },

  addCommands() {
    return {
      setPlaceholder:
        placeholder =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(placeholderSettingsPluginKey, placeholder)
          }
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: placeholderSettingsPluginKey,
        state: {
          init: () => this.options.placeholder,
          apply: (tr, placeholder) => tr.getMeta(placeholderSettingsPluginKey) ?? placeholder,
        },
      }),
      createPlaceholderPlugin({ editor: this.editor, options: this.options }),
    ]
  },
})
