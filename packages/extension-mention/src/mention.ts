import { Node } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

export interface MentionOptions {
  renderer: any,
}

export const Mention = Node.create({
  name: 'mention',

  defaultOptions: <MentionOptions>{
    renderer: null,
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
        char: '@',
        renderer: this.options.renderer,
      }),
    ]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Mention: typeof Mention,
  }
}
