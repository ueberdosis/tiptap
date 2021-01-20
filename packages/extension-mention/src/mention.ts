import { Node, mergeAttributes } from '@tiptap/core'
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion'

export type MentionOptions = {
  HTMLAttributes: {
    [key: string]: any,
  },
  suggestion: Omit<SuggestionOptions, 'editor'>,
}

export const Mention = Node.create({
  name: 'mention',

  defaultOptions: <MentionOptions>{
    HTMLAttributes: {},
    suggestion: {
      char: '@',
      command: ({ editor, range, attributes }) => {
        editor
          .chain()
          .focus()
          .replace(range, 'mention', attributes)
          .insertText(' ')
          .run()
      },
    },
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
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }

          return {
            'data-mention': attributes.id,
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
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), `@${node.attrs.id}`]
  },

  renderText({ node }) {
    return `@${node.attrs.id}`
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Mention: typeof Mention,
  }
}
