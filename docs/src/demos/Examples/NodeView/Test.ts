import { Node, mergeAttributes } from '@tiptap/core'
import { VueRenderer } from '@tiptap/vue'
import Component from './Component.vue'

export default Node.create({
  name: 'test',

  group: 'block',

  content: 'inline*',

  draggable: true,

  selectable: false,

  addAttributes() {
    return {
      checked: {
        default: false,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="test"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'test' }), 0]
  },

  addNodeView() {
    return VueRenderer(Component)
  },
})
