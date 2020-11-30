import { Node, mergeAttributes } from '@tiptap/core'
import { VueRenderer } from '@tiptap/vue'
import Component from './Component.vue'

export default Node.create({
  name: 'tableOfContents',

  group: 'block',

  atom: true,

  parseHTML() {
    return [
      {
        tag: 'toc',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['toc', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueRenderer(Component)
  },
})
