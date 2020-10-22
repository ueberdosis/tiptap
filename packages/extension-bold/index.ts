import {
  Command, createMark, markInputRule, markPasteRule,
} from '@tiptap/core'

// export type BoldCommand = () => Command

// declare module '@tiptap/core/src/Editor' {
//   interface Commands {
//     bold: BoldCommand,
//   }
// }

export const starInputRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))$/gm
export const starPasteRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))/gm
export const underscoreInputRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))$/gm
export const underscorePasteRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))/gm

export default createMark({
  name: 'bold',

  parseHTML() {
    return [
      {
        tag: 'strong',
      },
      {
        tag: 'b',
        getAttrs: node => (node as HTMLElement).style.fontWeight !== 'normal' && null,
      },
      {
        style: 'font-weight',
        getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
      },
    ]
  },

  renderHTML({ attributes }) {
    return ['strong', attributes, 0]
  },

  addCommands() {
    return {
      bold: () => ({ commands }) => {
        return commands.toggleMark('bold')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.bold(),
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
