import { Command, Node, mergeAttributes } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

export interface BulletListOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export const inputRegex = /^\s*([-+*])\s$/

const BulletList = Node.create({
  name: 'bulletList',

  defaultOptions: <BulletListOptions>{
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
      /**
       * Toggle a bullet list
       */
      toggleBulletList: (): Command => ({ commands }) => {
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

export default BulletList

declare module '@tiptap/core' {
  interface AllExtensions {
    BulletList: typeof BulletList,
  }
}
