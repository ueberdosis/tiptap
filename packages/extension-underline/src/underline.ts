import { Mark, mergeAttributes } from '@tiptap/core'

export interface UnderlineOptions {
  /**
   * HTML attributes to add to the underline element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    underline: {
      /**
       * Set an underline mark
       * @example editor.commands.setUnderline()
       */
      setUnderline: () => ReturnType
      /**
       * Toggle an underline mark
       * @example editor.commands.toggleUnderline()
       */
      toggleUnderline: () => ReturnType
      /**
       * Unset an underline mark
       * @example editor.commands.unsetUnderline()
       */
      unsetUnderline: () => ReturnType
    }
  }
}

/**
 * This extension allows you to create underline text.
 * @see https://www.tiptap.dev/api/marks/underline
 */
export const Underline = Mark.create<UnderlineOptions>({
  name: 'underline',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'u',
      },
      {
        style: 'text-decoration',
        consuming: false,
        getAttrs: style => ((style as string).includes('underline') ? {} : false),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['u', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  parseMarkdown(token, helpers) {
    return helpers.applyMark(this.name || 'underline', helpers.parseInline(token.tokens || []))
  },

  renderMarkdown(node, helpers) {
    return `<u>${helpers.renderChildren(node)}</u>`
  },

  markdownTokenizer: {
    name: 'underline',
    level: 'inline',
    start(src) {
      return src.toLowerCase().indexOf('<u>')
    },
    tokenize(src, _tokens, lexer) {
      const match = /^<u>([\s\S]+?)<\/u>/i.exec(src)

      if (!match) {
        return undefined
      }

      return {
        type: 'underline',
        raw: match[0],
        text: match[1],
        tokens: lexer.inlineTokens(match[1]),
      }
    },
  },

  addCommands() {
    return {
      setUnderline:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name)
        },
      toggleUnderline:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name)
        },
      unsetUnderline:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-u': () => this.editor.commands.toggleUnderline(),
      'Mod-U': () => this.editor.commands.toggleUnderline(),
    }
  },
})
