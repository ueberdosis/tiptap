import { mergeAttributes, Node } from '@dibdab/core'

export const Figcaption = Node.create({
  name: 'figcaption',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: 'inline*',

  selectable: false,

  draggable: false,

  parseHTML() {
    return [
      {
        tag: 'figcaption',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['figcaption', mergeAttributes(HTMLAttributes), 0]
  },
})
