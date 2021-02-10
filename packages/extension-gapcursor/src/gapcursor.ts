import { Extension } from '@tiptap/core'
import { gapCursor } from 'prosemirror-gapcursor'

export const Gapcursor = Extension.create({
  name: 'gapCursor',

  addProseMirrorPlugins() {
    return [
      gapCursor(),
    ]
  },
})
