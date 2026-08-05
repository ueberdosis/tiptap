import { Plugin, PluginKey } from '@tiptap/pm/state'

import { Extension } from '../Extension.js'

/**
 * Emits the editor's `drop` event when content is dropped into it.
 */
export const Drop = Extension.create({
  name: 'drop',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tiptapDrop'),

        props: {
          handleDrop: (_, e, slice, moved) => {
            this.editor.emit('drop', {
              editor: this.editor,
              event: e,
              slice,
              moved,
            })
          },
        },
      }),
    ]
  },
})
