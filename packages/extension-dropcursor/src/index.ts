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

declare global {
  namespace Tiptap {
    interface AllExtensions {
      Dropcursor: typeof Dropcursor,
    }
  }
}
