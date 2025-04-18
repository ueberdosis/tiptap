import { Mark } from '@tiptap/core'
import { VueMarkViewRenderer } from '@tiptap/vue-3'

import Component from './Component.vue'

export default Mark.create({
  name: 'vueComponent',

  parseHTML() {
    return [
      {
        tag: 'vue-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['vue-component', HTMLAttributes]
  },

  addMarkView() {
    return VueMarkViewRenderer(Component)
  },
})
