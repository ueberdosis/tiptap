import { Node } from '@tiptap/core'
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion'

export type MentionOptions = Omit<SuggestionOptions, 'editor'>

export const Mention = Node.create({
  name: 'mention',

  defaultOptions: <MentionOptions>{
    char: '@',
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => {
          return {
            id: element.getAttribute('data-mention'),
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-mention]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['span', HTMLAttributes, `@${node.attrs.id}`]
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options,
        command: ({ range, attributes }) => {
          this.editor
            .chain()
            .focus()
            .replace(range, 'mention', attributes)
            .insertText(' ')
            .run()
        },
      }),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Mention: typeof Mention,
  }
}
