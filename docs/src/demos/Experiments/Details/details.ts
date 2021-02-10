import { Node, mergeAttributes } from '@tiptap/core'

export interface DetailsOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export default Node.create({
  name: 'details',

  content: 'detailsSummary block+',

  group: 'block',

  defaultOptions: <DetailsOptions>{
    HTMLAttributes: {},
  },

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: element => {
          return {
            open: element.hasAttribute('open'),
          }
        },
        renderHTML: attributes => {
          if (!attributes.open) {
            return null
          }

          return {
            open: '',
          }
        },
      },
    }
  },

  parseHTML() {
    return [{
      tag: 'details',
    }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
})
