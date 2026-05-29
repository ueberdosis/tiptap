import { Extension } from '@tiptap/core'

import { DEFAULT_DATA_ATTRIBUTE } from './constants.js'
import { createPlaceholderPlugin } from './plugins/PlaceholderPlugin.js'
import type { PlaceholderOptions } from './types.js'

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

  addProseMirrorPlugins() {
    return [createPlaceholderPlugin({ editor: this.editor, options: this.options })]
  },
})
