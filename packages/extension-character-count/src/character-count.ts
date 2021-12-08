import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Node as ProseMirrorNode } from 'prosemirror-model'

export interface CharacterCountOptions {
  /**
   * The maximum number of characters that should be allowed. Defaults to `0`.
   */
  limit: number,
  /**
   * The mode by which the size is calculated. Defaults to 'textSize'.
   */
  mode: 'textSize' | 'nodeSize',
}

export interface CharacterCountStorage {
  /**
   * Get the number of characters for the current document.
   */
  characters?: (options: {
    node?: ProseMirrorNode,
    mode?: 'textSize' | 'nodeSize',
  }) => number,
}

export const CharacterCount = Extension.create<CharacterCountOptions, CharacterCountStorage>({
  name: 'characterCount',

  addOptions() {
    return {
      limit: 0,
      mode: 'textSize',
    }
  },

  addStorage() {
    return {
      characters: undefined,
    }
  },

  onBeforeCreate() {
    this.storage.characters = options => {
      const node = options?.node || this.editor.state.doc
      const mode = options?.mode || this.options.mode

      if (mode === 'textSize') {
        // TODO: maybe count blockSeparator and leaf nodes?
        // return node.textBetween(0, node.content.size, ' ', ' ').length

        return node.textContent.length
      }

      return node.nodeSize
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('characterCount'),
        filterTransaction: (transaction, state) => {
          // Nothing has changed. Ignore it.
          if (!transaction.docChanged) {
            return true
          }

          const limit = this.options.limit
          const oldSize = this.storage.characters?.({ node: state.doc }) || 0
          const newSize = this.storage.characters?.({ node: transaction.doc }) || 0

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
          const updatedSize = this.storage.characters?.({ node: transaction.doc }) || 0

          if (updatedSize > limit) {
            return false
          }

          return true
        },
      }),
    ]
  },
})
