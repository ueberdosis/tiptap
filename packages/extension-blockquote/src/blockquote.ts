import {
  findWrappingUntil, isNodeActive, mergeAttributes, Node, wrappingInputRule,
} from '@tiptap/core'

export interface BlockquoteOptions {
  /**
   * HTML attributes to add to the blockquote element
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockQuote: {
      /**
       * Set a blockquote node
       */
      setBlockquote: () => ReturnType,
      /**
       * Toggle a blockquote node
       */
      toggleBlockquote: () => ReturnType,
      /**
       * Unset a blockquote node
       */
      unsetBlockquote: () => ReturnType,
    }
  }
}

/**
 * Matches a blockquote to a `>` as input.
 */
export const inputRegex = /^\s*>\s$/

/**
 * This extension allows you to create blockquotes.
 * @see https://tiptap.dev/api/nodes/blockquote
 */
export const Blockquote = Node.create<BlockquoteOptions>({

  name: 'blockquote',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: 'block+',

  group: 'block',

  defining: true,

  parseHTML() {
    return [
      { tag: 'blockquote' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['blockquote', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setBlockquote: () => ({ tr }) => {
        const wrapping = findWrappingUntil(tr, this.type)

        if (wrapping) {
          tr.wrap(wrapping.range, wrapping.wrap)
          return true
        }

        return false
      },
      toggleBlockquote: () => ({ commands, state }) => {
        if (isNodeActive(state, this.type)) {
          return commands.unsetBlockquote()
        }

        return commands.setBlockquote()
      },
      unsetBlockquote: () => ({ commands }) => {
        return commands.lift(this.name)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-b': () => this.editor.commands.toggleBlockquote(),
    }
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ]
  },
})
