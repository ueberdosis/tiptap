import { Node } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

export const Mention = Node.create({
  name: 'mention',

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
      Suggestion({}),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Mention: typeof Mention,
  }
}
