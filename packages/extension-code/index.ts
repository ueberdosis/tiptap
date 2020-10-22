import {
  Command, createMark, markInputRule, markPasteRule,
} from '@tiptap/core'

// export type CodeCommand = () => Command

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     code: CodeCommand,
//   }
// }

export const inputRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))$/gm
export const pasteRegex = /(?:^|\s)((?:`)((?:[^`]+))(?:`))/gm

export default createMark({
  name: 'code',

  excludes: '_',

  parseHTML() {
    return [
      { tag: 'code' },
    ]
  },

  renderHTML({ attributes }) {
    return ['strong', attributes, 0]
  },

  addCommands() {
    return {
      code: () => ({ commands }) => {
        return commands.toggleMark('code')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-`': () => this.editor.code(),
    }
  },

  addInputRules() {
    return [
      markInputRule(inputRegex, this.type),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule(inputRegex, this.type),
    ]
  },
})
