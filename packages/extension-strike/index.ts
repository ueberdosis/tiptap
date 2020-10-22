import {
  Command, createMark, markInputRule, markPasteRule,
} from '@tiptap/core'

// type StrikeCommand = () => Command

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     strike: StrikeCommand,
//   }
// }

export const inputRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))$/gm
export const pasteRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))/gm

export default createMark({
  name: 'strike',

  parseHTML() {
    return [
      {
        tag: 's',
      },
      {
        tag: 'del',
      },
      {
        tag: 'strike',
      },
      {
        style: 'text-decoration',
        getAttrs: node => (node === 'line-through' ? {} : false),
      },
    ]
  },

  renderHTML({ attributes }) {
    return ['s', attributes, 0]
  },

  addCommands() {
    return {
      strike: () => ({ commands }) => {
        return commands.toggleMark('strike')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-d': () => this.editor.strike(),
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
