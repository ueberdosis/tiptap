import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export const pluginKey = new PluginKey('characterLimit')

export interface CharacterCountOptions {
  limit?: number,
}

export const CharacterCount = Extension.create<CharacterCountOptions>({
  name: 'characterCount',

  addOptions() {
    return {
      limit: 0,
    }
  },

  addProseMirrorPlugins() {
    const { options } = this

    return [
      new Plugin({

        key: pluginKey,

        appendTransaction: (transactions, oldState, newState) => {
          const length = newState.doc.content.size

          if (options.limit && length > options.limit) {
            return newState.tr.insertText('', options.limit + 1, length)
          }
        },
      }),
    ]
  },
})
