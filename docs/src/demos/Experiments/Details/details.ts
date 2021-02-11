import { Node, mergeAttributes } from '@tiptap/core'
// import { update } from 'cypress/types/lodash'

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

  parseHTML() {
    return [{
      tag: 'details',
    }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addNodeView() {
    return ({ HTMLAttributes }) => {
      const item = document.createElement('details')

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        item.setAttribute(key, value)
      })

      return {
        dom: item,
        contentDOM: item,
        ignoreMutation: (mutation: MutationRecord) => {
          return !item.contains(mutation.target) || item === mutation.target
        },
      }
    }
  },
})
