import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import Component from './Component.jsx'

export default Node.create({
  name: 'syncedNode',

  group: 'block',

  content: '(paragraph | heading)*',

  addAttributes() {
    return {
      syncedNodeId: {},
      imageSrc: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'synced-node',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['synced-node', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component)
  },
})
