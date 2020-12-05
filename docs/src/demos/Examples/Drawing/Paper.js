import { Node, mergeAttributes } from '@tiptap/core'
import { VueRenderer } from '@tiptap/vue'
import Component from './Component.vue'

export default Node.create({
  name: 'paper',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      lines: {
        default: [],
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="paper"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'paper' })]
  },

  addNodeView() {
    return VueRenderer(Component)
  },
})
