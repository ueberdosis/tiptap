import { Node, mergeAttributes } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

export interface BlockquoteOptions {
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

export const inputRegex = /^\s*>\s$/gm

export const Blockquote = Node.create<BlockquoteOptions>({

  name: 'blockquote',

  defaultOptions: {
    HTMLAttributes: {},
  },

  content: 'block*',

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
      setBlockquote: () => ({ commands }) => {
        return commands.wrapIn('blockquote')
      },
      toggleBlockquote: () => ({ commands }) => {
        return commands.toggleWrap('blockquote')
      },
      unsetBlockquote: () => ({ commands }) => {
        return commands.lift('blockquote')
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
      wrappingInputRule(inputRegex, this.type),
    ]
  },
})
