import { mergeAttributes, Node } from '@tiptap/core'
import { SvelteNodeViewRenderer } from '@tiptap/svelte'

import Component from './Component.svelte'

export default Node.create({
  name: 'draggableItem',

  group: 'block',

  content: 'block+',

  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="draggable-item"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'draggable-item' }), 0]
  },

  addNodeView() {
    return SvelteNodeViewRenderer(Component)
  },
})
