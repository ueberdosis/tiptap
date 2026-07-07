import { mergeAttributes, Node } from '@tiptap/core'

/**
 * Unlike the legacy demo, there is no `addNodeView()` here: with the
 * experimental React renderer, the component is registered on
 * `EditorContent` via the `nodeViews` prop (see index.tsx).
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
})
