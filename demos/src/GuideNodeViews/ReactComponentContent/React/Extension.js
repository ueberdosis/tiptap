import { mergeAttributes, Node } from '@dibdab/core'
import { ReactNodeViewRenderer } from '@dibdab/react'

import Component from './Component.jsx'

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
    return ReactNodeViewRenderer(Component)
  },
})
