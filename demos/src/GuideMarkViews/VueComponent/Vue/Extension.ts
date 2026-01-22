import { Mark } from '@dibdab/core'
import { VueMarkViewRenderer } from '@dibdab/vue-3'

import Component from './Component.vue'

export default Mark.create({
  name: 'vueComponent',

  addAttributes() {
    return {
      'data-count': { default: 0 },
    }
  },

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
