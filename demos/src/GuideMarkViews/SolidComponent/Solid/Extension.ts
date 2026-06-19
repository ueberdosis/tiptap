import { Mark } from '@tiptap/core'
import { SolidMarkViewRenderer } from '@tiptap/solid'

import Component from './Component.jsx'

export default Mark.create({
  name: 'solidComponent',

  addAttributes() {
    return {
      'data-count': { default: 0 },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'solid-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['solid-component', HTMLAttributes]
  },

  addMarkView() {
    return SolidMarkViewRenderer(Component)
  },
})
