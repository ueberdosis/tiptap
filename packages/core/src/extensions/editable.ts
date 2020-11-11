import { Plugin, PluginKey } from 'prosemirror-state'
import { createExtension } from '../Extension'

export const Editable = createExtension({
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

// TODO: Editable circularly references itself!?
// declare module '@tiptap/core' {
//   interface AllExtensions {
//     Editable: typeof Editable,
//   }
// }
