import { Plugin, PluginKey } from 'prosemirror-state'
import { Extension } from '../Extension'

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

declare module '@tiptap/core' {
  interface AllExtensions {
    Editable: typeof Editable,
  }
}
