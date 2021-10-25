import {
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core'

export interface ItalicOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    italic: {
      /**
       * Set an italic mark
       */
      setItalic: () => ReturnType,
      /**
       * Toggle an italic mark
       */
      toggleItalic: () => ReturnType,
      /**
       * Unset an italic mark
       */
      unsetItalic: () => ReturnType,
    }
  }
}

export const starInputRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/
export const starPasteRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))/g
export const underscoreInputRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))$/
export const underscorePasteRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))/g

export const Italic = Mark.create<ItalicOptions>({
  name: 'italic',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
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
      markInputRule({
        find: starInputRegex,
        type: this.type,
      }),
      markInputRule({
        find: underscoreInputRegex,
        type: this.type,
      }),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: starPasteRegex,
        type: this.type,
      }),
      markPasteRule({
        find: underscorePasteRegex,
        type: this.type,
      }),
    ]
  },
})
