import { Mark } from '@tiptap/core'
import { ReactMarkViewRenderer } from '@tiptap/react'

import Component from './Component.js'

export default Mark.create({
  name: 'reactComponent',

  parseHTML() {
    return [
      {
        tag: 'react-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['react-component', HTMLAttributes]
  },

  addMarkView() {
    return ReactMarkViewRenderer(Component)
  },
})
