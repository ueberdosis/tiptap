import { Extension } from '@tiptap/core'
import { dropCursor } from 'prosemirror-dropcursor'

export interface DropcursorOptions {
  color: string | null,
  width: number | null,
  class: string | null,
}

export const Dropcursor = Extension.create({
  name: 'dropCursor',

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

declare module '@tiptap/core' {
  interface AllExtensions {
    Dropcursor: typeof Dropcursor,
  }
}
