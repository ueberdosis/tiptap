import { mergeAttributes, Node } from '@tiptap/core'
import { nodeView } from '@tiptap/react-experimental'

import Component from './Component.jsx'

/**
 * Exactly like the legacy demo, the node view is configured on the
 * extension — `nodeView()` registers a native-contract component.
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

  addNodeView() {
    return nodeView(Component)
  },
})
