import { Plugin, PluginKey } from 'prosemirror-state'
import { Extension } from '../Extension'

export const Editable = Extension.create({
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

declare global {
  namespace Tiptap {
    interface AllExtensions {
      Editable: typeof Editable,
    }
  }
}
