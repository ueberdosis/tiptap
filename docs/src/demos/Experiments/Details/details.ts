import { Node, mergeAttributes, Command } from '@tiptap/core'

export interface DetailsOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export default Node.create({
  name: 'details',

  content: 'detailsSummary block+',

  group: 'block',

  // defining: true,

  defaultOptions: <DetailsOptions>{
    HTMLAttributes: {},
  },

  parseHTML() {
    return [
      {
        tag: 'details',
      },
      {
        tag: 'div[data-type="details"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addNodeView() {
    return ({ HTMLAttributes }) => {
      const item = document.createElement('div')
      item.setAttribute('data-type', 'details')

      const toggle = document.createElement('div')
      toggle.setAttribute('data-type', 'detailsToggle')
      item.append(toggle)

      const content = document.createElement('div')
      content.setAttribute('data-type', 'detailsContent')
      item.append(content)

      toggle.addEventListener('click', () => {
        if (item.hasAttribute('open')) {
          item.removeAttribute('open')
        } else {
          item.setAttribute('open', 'open')
        }
      })

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        item.setAttribute(key, value)
      })

      return {
        dom: item,
        contentDOM: content,
        ignoreMutation: (mutation: MutationRecord) => {
          return !item.contains(mutation.target) || item === mutation.target
        },
      }
    }
  },

  addCommands() {
    return {
      /**
       * Set a details node
       */
      setDetails: (): Command => ({ commands }) => {
        // TODO: Doesn’t work
        return commands.wrapIn('details')
      },
      /**
       * Toggle a details node
       */
      toggleDetails: (): Command => ({ commands }) => {
        // TODO: Doesn’t work
        return commands.toggleWrap('details')
      },
      /**
       * Unset a details node
       */
      unsetDetails: (): Command => ({ commands }) => {
        // TODO: Doesn’t work
        return commands.lift('details')
      },
    }
  },
})
