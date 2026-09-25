import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { Component } from './Component.tsx'

const Paper = Node.create({
  name: 'paper',

  group: 'block',
  atom: true,

  addAttributes() {
    return {
      lines: {
        default: [],
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="paper"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'paper' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component)
  },
})

export default Paper
