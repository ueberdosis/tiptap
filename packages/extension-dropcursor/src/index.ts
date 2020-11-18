import { Extension } from '@tiptap/core'
import { dropCursor } from 'prosemirror-dropcursor'

type DropcursorOptions = {
  color: string | null,
  width: number | null,
  class: string | null,
}

const Dropcursor = Extension.create({
  defaultOptions: <DropcursorOptions>{
    color: 'black',
    width: 1,
    class: null,
  },

  addProseMirrorPlugins() {
    return [
      dropCursor(this.options),
    ]
  },
})

export default Dropcursor

declare module '@tiptap/core' {
  interface AllExtensions {
    Dropcursor: typeof Dropcursor,
  }
}
