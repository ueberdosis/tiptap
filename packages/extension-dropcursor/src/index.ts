import { Extension } from '@tiptap/core'
import { dropCursor } from 'prosemirror-dropcursor'

const Dropcursor = Extension.create({
  addProseMirrorPlugins() {
    return [
      dropCursor(),
    ]
  },
})

export default Dropcursor

declare module '@tiptap/core' {
  interface AllExtensions {
    Dropcursor: typeof Dropcursor,
  }
}
