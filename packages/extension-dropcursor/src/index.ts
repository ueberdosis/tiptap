import { createExtension } from '@tiptap/core'
import { dropCursor } from 'prosemirror-dropcursor'

const Dropcursor = createExtension({
  addProseMirrorPlugins() {
    return [
      dropCursor(),
    ]
  },
})

export default Dropcursor

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    Dropcursor: typeof Dropcursor,
  }
}
