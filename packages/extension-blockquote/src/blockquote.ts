import { Command, Node, mergeAttributes } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

export interface BlockquoteOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

declare module '@tiptap/core' {
  interface Commands {
    setBlockquote: () => Command,
    toggleBlockquote: () => Command,
    unsetBlockquote: () => Command,
  }
}

export const inputRegex = /^\s*>\s$/gm

export const Blockquote = Node.create({

  name: 'blockquote',

  defaultOptions: <BlockquoteOptions>{
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
      /**
       * Set a blockquote node
       */
      setBlockquote: () => ({ commands }) => {
        return commands.wrapIn('blockquote')
      },
      /**
       * Toggle a blockquote node
       */
      toggleBlockquote: () => ({ commands }) => {
        return commands.toggleWrap('blockquote')
      },
      /**
       * Unset a blockquote node
       */
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
