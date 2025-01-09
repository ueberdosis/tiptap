import { Mark, mergeAttributes } from '@tiptap/core'
import { ReactMarkViewRenderer } from '@tiptap/react'

import Component from './Component.js'

export default Mark.create({
  name: 'reactComponent',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      count: {
        default: 0,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'react-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['react-component', mergeAttributes(HTMLAttributes)]
  },

  addMarkView() {
    return ReactMarkViewRenderer(Component)
  },
})
