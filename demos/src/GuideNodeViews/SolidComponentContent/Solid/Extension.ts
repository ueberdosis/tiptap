import { mergeAttributes, Node } from '@tiptap/core'
import { SolidNodeViewRenderer } from '@tiptap/solid'

import Component from './Component.jsx'

export default Node.create({
  name: 'solidComponent',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'solid-component',
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
    return ['solid-component', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return SolidNodeViewRenderer(Component)
  },
})
