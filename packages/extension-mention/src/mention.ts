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
      },
      label: {
        default: null,
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
    return ['span', HTMLAttributes, `@${node.attrs.label}`]
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options,
        command: ({ range }) => {
          this.editor
            .chain()
            .focus()
            .replace(range, 'mention')
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
