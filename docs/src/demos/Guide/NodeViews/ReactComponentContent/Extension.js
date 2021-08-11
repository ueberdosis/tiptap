import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import Component from './Component.jsx'

export default Node.create({
  name: 'reactComponent',

  group: 'block',

  content: 'block*',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'react-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['react-component', mergeAttributes(HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setReactComponent: () => ({ commands }) => {
        return commands.wrapIn('reactComponent')
      },
      toggleReactComponent: () => ({ commands }) => {
        return commands.toggleWrap('reactComponent')
      },
      unsetReactComponent: () => ({ commands }) => {
        return commands.lift('reactComponent')
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component)
  },
})
