// @ts-nocheck
import { Extension } from '@tiptap/core'
import {
  Plugin, PluginKey, EditorState, Transaction,
} from 'prosemirror-state'

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

        key: new PluginKey('characterLimit'),

        // state: {
        //   init(_, config) {
        //     // console.log(_, config)
        //     // const length = config.doc.content.size

        //     // if (length > options.limit) {
        //     //   console.log('too long', options.limit, config)

        //     //   const transaction = config.tr.insertText('', options.limit + 1, length)

        //     //   return config.apply(transaction)
        //     // }
        //   },
        //   apply() {
        //     //
        //   },
        // },

        appendTransaction: (transactions, oldState, newState) => {
          const oldLength = oldState.doc.content.size
          const newLength = newState.doc.content.size

          if (newLength > options.limit && newLength > oldLength) {
            const newTr = newState.tr
            newTr.insertText('', options.limit + 1, newLength)

            return newTr
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
