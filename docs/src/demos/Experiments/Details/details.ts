import { Node, mergeAttributes } from '@tiptap/core'

export interface DetailsOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export default Node.create<DetailsOptions>({
  name: 'details',

  content: 'detailsSummary block+',

  group: 'block',

  defaultOptions: {
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
            open: 'open',
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

  addNodeView() {
    return ({
      node,
      HTMLAttributes,
      getPos,
      editor,
    }) => {
      const { view } = editor
      const item = document.createElement('details')

      item.addEventListener('click', event => {
        // @ts-ignore
        const { open } = event.target.parentElement as HTMLElement
        // @ts-ignore
        const { localName } = event.target

        if (typeof getPos === 'function' && localName === 'summary') {
          view.dispatch(view.state.tr.setNodeMarkup(getPos(), undefined, {
            open: !open,
          }))
          editor.commands.focus()
        }
      })

      if (node.attrs.open) {
        item.setAttribute('open', 'open')
      }

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        item.setAttribute(key, value)
      })

      return {
        dom: item,
        contentDOM: item,
        update: updatedNode => {
          if (updatedNode.type !== this.type) {
            return false
          }

          if (updatedNode.attrs.open) {
            item.setAttribute('open', 'open')
          } else {
            item.removeAttribute('open')
          }

          return true
        },
      }
    }
  },
})
