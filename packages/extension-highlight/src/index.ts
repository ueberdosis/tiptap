import {
  Command,
  createMark,
  markInputRule,
  markPasteRule,
} from '@tiptap/core'

export const inputRegex = /(?:^|\s)((?:==)((?:[^~]+))(?:==))$/gm
export const pasteRegex = /(?:^|\s)((?:==)((?:[^~]+))(?:==))/gm

const Highlight = createMark({
  name: 'highlight',

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

  renderHTML({ attributes }) {
    return ['mark', attributes, 0]
  },

  addCommands() {
    return {
      highlight: (attributes?: { color: string }): Command => ({ commands }) => {
        return commands.toggleMark('highlight', attributes)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-e': () => this.editor.highlight(),
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
