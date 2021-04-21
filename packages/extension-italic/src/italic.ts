import {
  Command,
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core'

export interface ItalicOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands {
    italic: {
      /**
       * Set an italic mark
       */
      setItalic: () => Command,
      /**
       * Toggle an italic mark
       */
      toggleItalic: () => Command,
      /**
       * Unset an italic mark
       */
      unsetItalic: () => Command,
    }
  }
}

export const starInputRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/gm
export const starPasteRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))/gm
export const underscoreInputRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))$/gm
export const underscorePasteRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))/gm

export const Italic = Mark.create<ItalicOptions>({
  name: 'italic',

  defaultOptions: {
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
      setItalic: () => ({ commands }) => {
        return commands.setMark('italic')
      },
      toggleItalic: () => ({ commands }) => {
        return commands.toggleMark('italic')
      },
      unsetItalic: () => ({ commands }) => {
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
