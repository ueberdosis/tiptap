// @ts-nocheck
import { Extension } from '@tiptap/core'
import {
  Plugin, PluginKey,
} from 'prosemirror-state'

export const pluginKey = new PluginKey('characterLimit')

export interface CharacterLimitOptions {
  limit: number,
}

export const CharacterLimit = Extension.create({
  name: 'characterLimit',

  defaultOptions: <CharacterLimitOptions>{
    limit: 100,
  },

  addProseMirrorPlugins() {
    const { options } = this

    return [
      new Plugin({

        key: pluginKey,

        appendTransaction: (transactions, oldState, newState) => {
          const length = newState.doc.content.size

          if (length > options.limit) {
            return newState.tr.insertText('', options.limit + 1, length)
          }
        },
      }),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    CharacterLimit: typeof CharacterLimit,
  }
}
