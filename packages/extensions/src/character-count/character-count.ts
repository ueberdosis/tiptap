import { Extension } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import { Plugin } from '@tiptap/pm/state'

import { characterCountPluginKey } from './characterCountPluginKey.js'
import { hasCharacterLimit } from './hasCharacterLimit.js'

export interface CharacterCountOptions {
  /**
   * The maximum number of characters that should be allowed. Defaults to `0`.
   * @default null
   * @example 180
   */
  limit: number | null | undefined
  /**
   * The mode by which the size is calculated. If set to `textSize`, the textContent of the document is used.
   * If set to `nodeSize`, the nodeSize of the document is used.
   * @default 'textSize'
   * @example 'textSize'
   */
  mode: 'textSize' | 'nodeSize'
  /**
   * Sets whether the content will be automatically trimmed when programatically setting content over the limit.
   * If set to false, the user will be able to trim the text manually.
   * @default true
   * @example false
   */
  autoTrim?: boolean
  /**
   * The text counter function to use. Defaults to a simple character count.
   * @default (text) => text.length
   * @example (text) => [...new Intl.Segmenter().segment(text)].length
   */
  textCounter: (text: string) => number
  /**
   * The word counter function to use. Defaults to a simple word count.
   * @default (text) => text.split(' ').filter(word => word !== '').length
   * @example (text) => text.split(/\s+/).filter(word => word !== '').length
   */
  wordCounter: (text: string) => number
}

export interface CharacterCountStorage {
  /**
   * Get the number of characters for the current document.
   * @param options The options for the character count. (optional)
   * @param options.node The node to get the characters from. Defaults to the current document.
   * @param options.mode The mode by which the size is calculated. If set to `textSize`, the textContent of the document is used.
   */
  characters: (options?: { node?: PMNode; mode?: 'textSize' | 'nodeSize' }) => number

  /**
   * Get the number of words for the current document.
   * @param options The options for the character count. (optional)
   * @param options.node The node to get the words from. Defaults to the current document.
   */
  words: (options?: { node?: PMNode }) => number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    characterCount: {
      /**
       * Update the character limit without trimming existing content.
       * @param limit A nonnegative limit, or null to remove it. Zero also removes the limit.
       * @returns Whether the limit is valid.
       * @example editor.commands.setCharacterLimit(500)
       */
      setCharacterLimit: (limit: number | null) => ReturnType
    }
  }

  interface Storage {
    characterCount: CharacterCountStorage
  }
}

/**
 * This extension allows you to count the characters and words of your document.
 * @see https://tiptap.dev/api/extensions/character-count
 */
export const CharacterCount = Extension.create<CharacterCountOptions, CharacterCountStorage>({
  name: 'characterCount',

  addOptions() {
    return {
      limit: null,
      autoTrim: true,
      mode: 'textSize',
      textCounter: text => text.length,
      wordCounter: text => text.split(' ').filter(word => word !== '').length,
    }
  },

  addStorage() {
    return {
      characters: () => 0,
      words: () => 0,
    }
  },

  onBeforeCreate() {
    this.storage.characters = options => {
      const node = options?.node || this.editor.state.doc
      const mode = options?.mode || this.options.mode

      if (mode === 'textSize') {
        const text = node.textBetween(0, node.content.size, undefined, ' ')

        return this.options.textCounter(text)
      }

      return node.nodeSize
    }

    this.storage.words = options => {
      const node = options?.node || this.editor.state.doc
      const text = node.textBetween(0, node.content.size, ' ', ' ')

      return this.options.wordCounter(text)
    }
  },

  addCommands() {
    return {
      setCharacterLimit:
        limit =>
        ({ tr, dispatch }) => {
          if (limit !== null && (!Number.isFinite(limit) || limit < 0)) {
            return false
          }
          if (dispatch) {
            tr.setMeta(characterCountPluginKey, { limit })
          }
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: characterCountPluginKey,
        state: {
          init: () => ({ limit: this.options.limit, initialized: false }),
          apply: (tr, previous) => {
            const update = tr.getMeta(characterCountPluginKey)
            return {
              limit: update === undefined ? previous.limit : update.limit,
              initialized: true,
            }
          },
        },
        appendTransaction: (transactions, oldState, newState) => {
          if (characterCountPluginKey.getState(oldState)?.initialized) {
            return
          }

          if (transactions.some(tr => tr.getMeta(characterCountPluginKey) !== undefined)) {
            return
          }

          const limit = characterCountPluginKey.getState(newState)?.limit
          const autoTrim = this.options.autoTrim

          if (!hasCharacterLimit(limit) || autoTrim === false) {
            return
          }

          const initialContentSize = this.storage.characters({ node: newState.doc })

          if (initialContentSize > limit) {
            const over = initialContentSize - limit
            const from = 0
            const to = over

            console.warn(
              `[CharacterCount] Initial content exceeded limit of ${limit} characters. Content was automatically trimmed.`,
            )
            const tr = newState.tr.deleteRange(from, to)
            return tr
          }
        },
        filterTransaction: (transaction, state) => {
          const update = transaction.getMeta(characterCountPluginKey)
          const limit =
            update === undefined ? characterCountPluginKey.getState(state)?.limit : update.limit

          // Nothing has changed or no limit is defined. Ignore it.
          if (!transaction.docChanged || !hasCharacterLimit(limit)) {
            return true
          }

          const oldSize = this.storage.characters({ node: state.doc })
          const newSize = this.storage.characters({ node: transaction.doc })

          // Everything is in the limit. Good.
          if (newSize <= limit) {
            return true
          }

          // The limit has already been exceeded but will be reduced.
          if (oldSize > limit && newSize > limit && newSize <= oldSize) {
            return true
          }

          // The limit has already been exceeded and will be increased further.
          if (oldSize > limit && newSize > limit && newSize > oldSize) {
            return false
          }

          const isPaste = transaction.getMeta('paste')

          // Block all exceeding transactions that were not pasted.
          if (!isPaste) {
            return false
          }

          // For pasted content, we try to remove the exceeding content.
          const pos = transaction.selection.$head.pos
          const over = newSize - limit
          const from = pos - over
          const to = pos

          // It’s probably a bad idea to mutate transactions within `filterTransaction`
          // but for now this is working fine.
          transaction.deleteRange(from, to)

          // In some situations, the limit will continue to be exceeded after trimming.
          // This happens e.g. when truncating within a complex node (e.g. table)
          // and ProseMirror has to close this node again.
          // If this is the case, we prevent the transaction completely.
          const updatedSize = this.storage.characters({ node: transaction.doc })

          if (updatedSize > limit) {
            return false
          }

          return true
        },
      }),
    ]
  },
})
