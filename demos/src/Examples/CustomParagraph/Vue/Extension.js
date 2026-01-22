import { Paragraph as BaseParagraph } from '@dibdab/extension-paragraph'
import { VueNodeViewRenderer } from '@dibdab/vue-3'

import Component from './Component.vue'

export default BaseParagraph.extend({
  addNodeView() {
    return VueNodeViewRenderer(Component)
  },
})
