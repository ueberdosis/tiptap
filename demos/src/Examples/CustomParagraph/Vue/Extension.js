import { Paragraph as BaseParagraph } from '@tiptap/extension-paragraph'
import { VueNodeViewRenderer } from '@tiptap/vue'

import Component from './Component.vue'

export default BaseParagraph.extend({
  addNodeView() {
    return VueNodeViewRenderer(Component)
  },
})
