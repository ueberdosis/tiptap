import { Paragraph as BaseParagraph } from '@tiptap/editor/extensions/paragraph'
import { VueNodeViewRenderer } from '@tiptap/vue'

import Component from './Component.vue'

export default BaseParagraph.extend({
  addNodeView() {
    return VueNodeViewRenderer(Component)
  },
})
