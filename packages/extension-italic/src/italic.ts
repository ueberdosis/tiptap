import {
  Command,
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
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

export const Italic = Mark.create({
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
    return ['em', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      /**
       * Set an italic mark
       */
      setItalic: (): Command => ({ commands }) => {
        return commands.setMark('italic')
      },
      /**
       * Toggle an italic mark
       */
      toggleItalic: (): Command => ({ commands }) => {
        return commands.toggleMark('italic')
      },
      /**
       * Unset an italic mark
       */
      unsetItalic: (): Command => ({ commands }) => {
        return commands.unsetMark('italic')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-i': () => this.editor.commands.toggleItalic(),
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

declare module '@tiptap/core' {
  interface AllExtensions {
    Italic: typeof Italic,
  }
}
