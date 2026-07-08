import { Node } from '@tiptap/core'

/**
 * The same resizable node as the legacy demo, minus the imperative
 * `addNodeView()`: with the experimental React renderer, the resizable
 * component is registered on `EditorContent` via the `nodeViews` prop.
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
})
