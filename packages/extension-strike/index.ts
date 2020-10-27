import {
  Command, createMark, markInputRule, markPasteRule,
} from '@tiptap/core'

export const inputRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))$/gm
export const pasteRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))/gm

const Strike = createMark({
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
      strike: (): Command => ({ commands }) => {
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

export default Strike

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    Strike: typeof Strike,
  }
}
