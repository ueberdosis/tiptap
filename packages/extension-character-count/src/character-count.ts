import {
  Extension,
  getTextBetween,
  getTextSeralizersFromSchema,
} from '@tiptap/core'

import { Plugin, PluginKey } from 'prosemirror-state'

export const pluginKey = new PluginKey('characterLimit')

export interface CharacterCountOptions {
  limit?: number,
  countThroughSerializer?: boolean
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
    const { storage } = this.editor
    return [
      new Plugin({

        key: pluginKey,

        appendTransaction: (transactions, oldState, newState) => {
          const length = !options.countThroughSerializer
            ? newState.doc.content.size
            : getTextBetween(
              newState.doc,
              { from: 0, to: newState.doc.content.size },
              { textSerializers: getTextSeralizersFromSchema(newState.schema) },
            ).length
          storage.characterCount = { currentCharacterCount: length }
          if (options.limit && length > options.limit) {
            return newState.tr.insertText('', options.limit + 1, length)
          }
        },
      }),
    ]
  },
})
