import {
  Command, createMark,
} from '@tiptap/core'

export interface HighlightOptions {
  color: string,
}

const Highlight = createMark({
  name: 'highlight',

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => {
          return {
            color: element.style.backgroundColor,
          }
        },
        renderHTML: attributes => {
          if (!attributes.color) {
            return {}
          }

          return {
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
      highlight: (attrs?: HighlightOptions): Command => ({ commands }) => {
        return commands.toggleMark('highlight')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-e': () => this.editor.highlight(),
    }
  },
})

export default Highlight

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    Highlight: typeof Highlight,
  }
}
