import { mergeAttributes, Node } from '@tiptap/core'
import { nodeView } from '@tiptap/react-experimental'

import Component from './Component.jsx'

/**
 * Exactly like the legacy demo, the node view is configured on the
 * extension — `nodeView()` registers a native-contract component (the
 * component owns its markup and attaches the `ref` itself).
 */
export default Node.create({
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

  addNodeView() {
    return nodeView(Component)
  },
})
