import {
  Command,
  Mark,
  markInputRule,
  markPasteRule,
} from '@tiptap/core'

export interface ItalicOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export const starInputRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/gm
export const starPasteRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))/gm
export const underscoreInputRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))$/gm
export const underscorePasteRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))/gm

const Italic = Mark.create({
  name: 'italic',

  defaultOptions: <ItalicOptions>{
    HTMLAttributes: {},
  },

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

  renderHTML({ HTMLAttributes }) {
    return ['em', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      /**
       * Toggle an italic mark
       */
      italic: (): Command => ({ commands }) => {
        return commands.toggleMark('italic')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-i': () => this.editor.commands.italic(),
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

export default Italic

declare global {
  namespace Tiptap {
    interface AllExtensions {
      Italic: typeof Italic,
    }
  }
}
