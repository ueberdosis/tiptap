import {
  Command, createMark, markInputRule, markPasteRule,
} from '@tiptap/core'

// export type ItalicCommand = () => Command

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     italic: ItalicCommand,
//   }
// }

export const starInputRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/gm
export const starPasteRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))/gm
export const underscoreInputRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))$/gm
export const underscorePasteRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))/gm

export default createMark({
  name: 'italic',

  parseHTML() {
    return [
      {
        tag: 'em',
      },
      {
        tag: 'i',
        getAttrs: node => (node as HTMLElement).style.fontStyle !== 'normal' && null,
      },
      {
        style: 'font-style=italic',
      },
    ]
  },

  renderHTML({ attributes }) {
    return ['em', attributes, 0]
  },

  addCommands() {
    return {
      italic: () => ({ commands }) => {
        return commands.toggleMark('italic')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-i': () => this.editor.italic(),
    }
  },

  addInputRules() {
    return [
      markInputRule(starInputRegex, this.type),
      markInputRule(underscoreInputRegex, this.type),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule(starPasteRegex, this.type),
      markPasteRule(underscorePasteRegex, this.type),
    ]
  },
})
