import {
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core'

export interface HighlightOptions {
  /**
   * Allow multiple highlight colors
   * @default false
   * @example true
   */
  multicolor: boolean,

  /**
   * HTML attributes to add to the highlight element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    highlight: {
      /**
       * Set a highlight mark
       * @param attributes The highlight attributes
       * @example editor.commands.setHighlight({ color: 'red' })
       */
      setHighlight: (attributes?: { color: string }) => ReturnType,
      /**
       * Toggle a highlight mark
       * @param attributes The highlight attributes
       * @example editor.commands.toggleHighlight({ color: 'red' })
       */
      toggleHighlight: (attributes?: { color: string }) => ReturnType,
      /**
       * Unset a highlight mark
       * @example editor.commands.unsetHighlight()
       */
      unsetHighlight: () => ReturnType,
    }
  }
}

/**
 * Matches a highlight to a ==highlight== on input.
 */
export const inputRegex = /(?:^|\s)(==(?!\s+==)((?:[^=]+))==(?!\s+==))$/

/**
 * Matches a highlight to a ==highlight== on paste.
 */
export const pasteRegex = /(?:^|\s)(==(?!\s+==)((?:[^=]+))==(?!\s+==))/g

/**
 * This extension allows you to highlight text.
 * @see https://www.tiptap.dev/api/marks/highlight
 */
export const Highlight = Mark.create<HighlightOptions>({
  name: 'highlight',

  addOptions() {
    return {
      multicolor: false,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    if (!this.options.multicolor) {
      return {}
    }

    return {
      color: {
        default: null,
        parseHTML: element => element.getAttribute('data-color') || element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.color) {
            return {}
          }

          return {
            'data-color': attributes.color,
            style: `background-color: ${attributes.color}; color: inherit`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'mark',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setHighlight: attributes => ({ commands }) => {
        return commands.setMark(this.name, attributes)
      },
      toggleHighlight: attributes => ({ commands }) => {
        return commands.toggleMark(this.name, attributes)
      },
      unsetHighlight: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-h': () => this.editor.commands.toggleHighlight(),
    }
  },

  addInputRules() {
    return [
      markInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex,
        type: this.type,
      }),
      markPasteRule({
        find: (_, event) => {
          const htmlStr = event?.clipboardData?.getData('text/html')

          if (!htmlStr) {
            return
          }

          const doc = new DOMParser().parseFromString(htmlStr, 'text/html')

          let indexAcc = 0

          // skip if there are any paragraphs as it will make the character counting a lot harder
          if (doc.querySelectorAll('p').length > 0) {
            return
          }

          return [...doc.querySelectorAll('span')].map(el => {
            const color = el.style.backgroundColor
            const text = el.textContent
            const index = indexAcc

            if (!text) {
              return
            }

            // we only want to count text for elements which have the text node as a direct child
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
              indexAcc += text.length
            }
            if (!color || color === 'rgb(255, 255, 255)' || color === 'transparent') {
              return
            }

            return { text, data: { color }, index }
          }).filter(m => !!m)
        },
        type: this.type,
        getAttributes: match => ({
          'data-color': match.data?.color,
          style: `background-color: ${match.data?.color}; color: inherit`,
        }),
      }),
    ]
  },
})
