import { Command, createNode } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

export const inputRegex = /^\s*([-+*])\s$/

const BulletList = createNode({
  name: 'bulletList',

  group: 'block list',

  content: 'listItem+',

  parseHTML() {
    return [
      { tag: 'ul' },
    ]
  },

  renderHTML({ attributes }) {
    return ['ul', attributes, 0]
  },

  addCommands() {
    return {
      bulletList: (): Command => ({ commands }) => {
        return commands.toggleList('bulletList', 'listItem')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Shift-Control-8': () => this.editor.bulletList(),
    }
  },

  addInputRules() {
    return [
      wrappingInputRule(inputRegex, this.type),
    ]
  },
})

export default BulletList

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    BulletList: typeof BulletList,
  }
}
