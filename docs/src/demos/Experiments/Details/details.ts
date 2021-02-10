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

  parseHTML() {
    return [{
      tag: 'details',
    }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addNodeView() {
    return ({
      HTMLAttributes,
    }) => {
      const item = document.createElement('details')

      // TODO: Why does that have to be true?
      let open = true

      item.addEventListener('click', event => {
        // @ts-ignore
        const { localName } = event.target

        if (localName === 'summary') {
          open = !open

          if (open) {
            item.setAttribute('open', 'open')
          } else {
            item.removeAttribute('open')
          }
        }
      })

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        item.setAttribute(key, value)
      })

      return {
        dom: item,
        contentDOM: item,
        ignoreMutation: (updatedNode: MutationRecord) => {
          return updatedNode.attributeName === 'open'
        },
      }
    }
  },
})
