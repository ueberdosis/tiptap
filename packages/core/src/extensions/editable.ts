import { Plugin, PluginKey } from '@tiptap/pm/state'

import { Extension } from '../Extension.js'

/**
 * Keeps the ProseMirror view in sync with `editor.isEditable`.
 */
export const Editable = Extension.create({
  name: 'editable',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('editable'),
        props: {
          editable: () => this.editor.options.editable,
        },
      }),
    ]
  },
})
