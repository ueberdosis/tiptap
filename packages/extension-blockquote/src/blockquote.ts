import { Command, Node, mergeAttributes } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

export interface BlockquoteOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

declare module '@tiptap/core' {
  interface Commands {
    /**
     * Set a blockquote node
     */
    setBlockquote: () => Command,
    /**
     * Toggle a blockquote node
     */
    toggleBlockquote: () => Command,
    /**
     * Unset a blockquote node
     */
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
