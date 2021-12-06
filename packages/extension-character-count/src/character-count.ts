import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export interface CharacterCountOptions {
  limit: number,
}

export const CharacterCount = Extension.create<CharacterCountOptions>({
  name: 'characterCount',

  addOptions() {
    return {
      limit: 0,
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('characterCount'),
        appendTransaction: (transactions, oldState, newState) => {
          const limit = this.options.limit + 2
          const oldSize = oldState.doc.content.size
          const newSize = newState.doc.content.size

          if (newSize <= oldSize || newSize <= limit) {
            return
          }

          const pos = newState.selection.$head.pos
          const over = newSize - limit
          const from = pos - over
          const to = pos
          const tr = newState.tr.delete(from, to)

          return tr
        },
      }),
    ]
  },
})
