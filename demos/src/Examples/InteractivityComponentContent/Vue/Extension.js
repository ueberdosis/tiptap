import { mergeAttributes, Node } from '@dibdab/core'
import { VueNodeViewRenderer } from '@dibdab/vue-3'

import Component from './Component.vue'

export default Node.create({
  name: 'vueComponent',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'vue-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['vue-component', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(Component)
  },
})
