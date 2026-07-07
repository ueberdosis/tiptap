import { mergeAttributes, Node } from '@tiptap/core'

/**
 * Unlike the legacy demo, there is no `addNodeView()` here: with the
 * experimental React renderer, the component is registered on
 * `EditorContent` via the `nodeViews` prop (see index.tsx).
 */
export default Node.create({
  name: 'reactComponent',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'react-component',
      },
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => {
        return this.editor
          .chain()
          .insertContentAt(this.editor.state.selection.head, { type: this.type.name })
          .focus()
          .run()
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['react-component', mergeAttributes(HTMLAttributes), 0]
  },
})
