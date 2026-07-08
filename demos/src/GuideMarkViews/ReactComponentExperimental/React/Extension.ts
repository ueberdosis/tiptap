import { Mark, mergeAttributes } from '@tiptap/core'

/**
 * Unlike the legacy demo, there is no `addMarkView()` here: with the
 * experimental React renderer, the component is registered on
 * `EditorContent` via the `markViews` prop (see index.tsx).
 */
export default Mark.create({
  name: 'reactComponent',

  addAttributes() {
    return {
      'data-count': { default: 0 },
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
