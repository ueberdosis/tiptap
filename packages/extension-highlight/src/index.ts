import {
  Command,
  Mark,
  markInputRule,
  markPasteRule,
} from '@tiptap/core'

export interface HighlightOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export const inputRegex = /(?:^|\s)((?:==)((?:[^~]+))(?:==))$/gm
export const pasteRegex = /(?:^|\s)((?:==)((?:[^~]+))(?:==))/gm

const Highlight = Mark.create({
  name: 'highlight',

  defaultOptions: <HighlightOptions>{
    HTMLAttributes: {},
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => {
          return {
            color: element.getAttribute('data-color') || element.style.backgroundColor,
          }
        },
        renderHTML: attributes => {
          if (!attributes.color) {
            return {}
          }

          return {
            'data-color': attributes.color,
            style: `background-color: ${attributes.color}`,
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
    return ['mark', HTMLAttributes, 0]
  },

  addCommands() {
    return {
      /**
       * Set a highlight mark
       */
      setHighlight: (attributes?: { color: string }): Command => ({ commands }) => {
        return commands.setMark('highlight', attributes)
      },
      /**
       * Toggle a highlight mark
       */
      toggleHighlight: (attributes?: { color: string }): Command => ({ commands }) => {
        return commands.toggleMark('highlight', attributes)
      },
      /**
       * Unset a highlight mark
       */
      unsetHighlight: (): Command => ({ commands }) => {
        return commands.removeMark('highlight')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-e': () => this.editor.commands.toggleHighlight(),
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

export default Highlight

declare module '@tiptap/core' {
  interface AllExtensions {
    Highlight: typeof Highlight,
  }
}
