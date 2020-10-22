import { Command, createNode } from '@tiptap/core'
import { wrappingInputRule } from 'prosemirror-inputrules'

// export type BlockquoteCommand = () => Command

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     blockquote: BlockquoteCommand,
//   }
// }

export const inputRegex = /^\s*>\s$/gm

export default createNode({
  name: 'blockquote',

  content: 'block*',

  group: 'block',

  defining: true,

  parseHTML() {
    return [
      { tag: 'blockquote' },
    ]
  },

  renderHTML({ attributes }) {
    return ['blockquote', attributes, 0]
  },

  addCommands() {
    return {
      blockquote: () => ({ commands }) => {
        return commands.toggleWrap('blockquote')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Shift-Mod-9': () => this.editor.blockquote(),
    }
  },

  addInputRules() {
    return [
      wrappingInputRule(inputRegex, this.type),
    ]
  },
})
