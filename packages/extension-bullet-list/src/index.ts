import { Command, Node } from '@tiptap/core'
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
    return ['ul', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      /**
       * Toggle a bullet list
       */
      bulletList: (): Command => ({ commands }) => {
        return commands.toggleList('bulletList', 'listItem')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Shift-Control-8': () => this.editor.commands.bulletList(),
    }
  },

  addInputRules() {
    return [
      wrappingInputRule(inputRegex, this.type),
    ]
  },
})

export default BulletList

declare global {
  namespace Tiptap {
    interface AllExtensions {
      BulletList: typeof BulletList,
    }
  }
}
