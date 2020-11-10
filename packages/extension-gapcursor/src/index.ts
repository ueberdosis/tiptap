import { createExtension } from '@tiptap/core'
import { gapCursor } from 'prosemirror-gapcursor'

const Gapcursor = createExtension({
  addProseMirrorPlugins() {
    return [
      gapCursor(),
    ]
  },
})

export default Gapcursor

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    Gapcursor: typeof Gapcursor,
  }
}
