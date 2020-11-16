import { Extension } from '@tiptap/core'
import { gapCursor } from 'prosemirror-gapcursor'

const Gapcursor = Extension.create({
  addProseMirrorPlugins() {
    return [
      gapCursor(),
    ]
  },
})

export default Gapcursor

declare global {
  namespace Tiptap {
    interface AllExtensions {
      Gapcursor: typeof Gapcursor,
    }
  }
}
