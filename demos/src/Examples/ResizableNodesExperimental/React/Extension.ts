import { Node } from '@tiptap/core'
import { nodeView } from '@tiptap/react-experimental'

import Component from './Component.jsx'

/**
 * The same resizable node as the legacy demo — the resizable component is
 * configured on the extension via `nodeView()` (native contract, no
 * imperative node view).
 */
export default Node.create({
  name: 'resizableNode',
  group: 'block',
  content: 'block+',
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      width: {
        default: 'auto',
      },
      height: {
        default: 'auto',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-resizer]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        'data-resizer': '',
        style: `width: ${HTMLAttributes.width}; height: ${HTMLAttributes.height}; border: 1px solid black; box-sizing: border-box;`,
      },
      0,
    ]
  },

  addNodeView() {
    return nodeView(Component)
  },
})
