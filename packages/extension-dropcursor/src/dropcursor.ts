import { Extension } from '@tiptap/core'
import { dropCursor } from 'prosemirror-dropcursor'

export interface DropcursorOptions {
  color: string | undefined,
  width: number | undefined,
  class: string | undefined,
}

export const Dropcursor = Extension.create<DropcursorOptions>({
  name: 'dropCursor',

  addOptions() {
    return {
      color: 'currentColor',
      width: 1,
      class: undefined,
    }
  },

  addProseMirrorPlugins() {
    return [
      dropCursor(this.options),
    ]
  },
})
