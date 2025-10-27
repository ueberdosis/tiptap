import { Mark, markInputRule, markPasteRule, mergeAttributes } from '@tiptap/core'

export interface ItalicOptions {
  /**
   * HTML attributes to add to the italic element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    italic: {
      /**
       * Set an italic mark
       * @example editor.commands.setItalic()
       */
      setItalic: () => ReturnType
      /**
       * Toggle an italic mark
       * @example editor.commands.toggleItalic()
       */
      toggleItalic: () => ReturnType
      /**
       * Unset an italic mark
       * @example editor.commands.unsetItalic()
       */
      unsetItalic: () => ReturnType
    }
  }
}

/**
 * Matches an italic to a *italic* on input.
 */
export const starInputRegex = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))$/

/**
 * Matches an italic to a *italic* on paste.
 */
export const starPasteRegex = /(?:^|\s)(\*(?!\s+\*)((?:[^*]+))\*(?!\s+\*))/g

/**
 * Matches an italic to a _italic_ on input.
 */
export const underscoreInputRegex = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))$/

/**
 * Matches an italic to a _italic_ on paste.
 */
export const underscorePasteRegex = /(?:^|\s)(_(?!\s+_)((?:[^_]+))_(?!\s+_))/g

/**
 * This extension allows you to create italic text.
 * @see https://www.tiptap.dev/api/marks/italic
 */
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
        style: 'font-style=normal',
        clearMark: mark => mark.type.name === this.name,
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
      setItalic:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name)
        },
      toggleItalic:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name)
        },
      unsetItalic:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  markdownTokenName: 'em',

  parseMarkdown: (token, helpers) => {
    // Convert 'em' token to italic mark
    return helpers.applyMark('italic', helpers.parseInline(token.tokens || []))
  },

  renderMarkdown: (node, h) => {
    return `*${h.renderChildren(node)}*`
  },

  addKeyboardShortcuts() {
    return {
      'Mod-i': () => this.editor.commands.toggleItalic(),
      'Mod-I': () => this.editor.commands.toggleItalic(),
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
