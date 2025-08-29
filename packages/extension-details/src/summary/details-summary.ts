import { mergeAttributes, Node } from '@tiptap/core'

export interface DetailsSummaryOptions {
  /**
   * Custom HTML attributes that should be added to the rendered HTML tag.
   */
  HTMLAttributes: {
    [key: string]: any
  }
}

export const DetailsSummary = Node.create<DetailsSummaryOptions>({
  name: 'detailsSummary',

  content: 'text*',

  defining: true,

  selectable: false,

  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'summary',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['summary', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  markdown: {
    render: (node, h) => {
      const content = node.content ? h.renderChildren(node.content) : ''

      return `[@summary ${content}]`
    },
  },
})
