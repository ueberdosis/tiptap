import { Command, Node, mergeAttributes } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

export interface BulletListOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

declare module '@tiptap/core' {
  interface Commands {
    /**
     * Toggle a bullet list
     */
    toggleBulletList: () => Command,
  }
}

export const inputRegex = /^\s*([-+*])\s$/

export const BulletList = Node.create<BulletListOptions>({
  name: 'bulletList',

  defaultOptions: {
    HTMLAttributes: {},
  },

  group: 'block list',

  content: 'listItem+',

  parseHTML() {
    return [
      { tag: 'ul' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['ul', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      toggleBulletList: () => ({ commands }) => {
        return commands.toggleList('bulletList', 'listItem')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-8': () => this.editor.commands.toggleBulletList(),
    }
  },

  addInputRules() {
    return [
      wrappingInputRule(inputRegex, this.type),
    ]
  },
})
