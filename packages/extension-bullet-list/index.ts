import { Command, createNode } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

// export type BulletListCommand = () => Command

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     bulletList: BulletListCommand,
//   }
// }

export default createNode({
  name: 'bullet_list',

  content: 'list_item+',

  group: 'block',

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
      bulletList: () => ({ commands }) => {
        return commands.toggleList('bullet_list', 'list_item')
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
      wrappingInputRule(/^\s*([-+*])\s$/, this.type),
    ]
  },
})
