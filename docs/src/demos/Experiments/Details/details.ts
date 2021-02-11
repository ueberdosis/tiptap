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
