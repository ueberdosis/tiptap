import { mergeAttributes, Node } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import type { EditorProps } from '@tiptap/pm/view'

export const CustomNode = Node.create({
  name: 'customNode',

  parseHTML() {
    return [{ tag: 'aside[data-type="custom-node"]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'aside',
      mergeAttributes(HTMLAttributes, { 'data-type': 'custom-node' }),
      node.attrs.highlighted
        ? 'Highlighted custom node. Click to reset.'
        : 'Custom node. Click to highlight.',
    ]
  },

  addProseMirrorPlugins() {
    const name = this.name
    const toggleHighlight: NonNullable<EditorProps['handleClickOn']> = (
      view,
      _position,
      node,
      nodePosition,
      _event,
      direct,
    ) => {
      if (_event.button !== 0 || !view.editable || !direct || node.type.name !== name) {
        return false
      }

      view.dispatch(
        view.state.tr.setNodeMarkup(nodePosition, undefined, {
          ...node.attrs,
          highlighted: !node.attrs.highlighted,
        }),
      )

      return true
    }

    return [
      new Plugin({
        props: {
          handleClickOn: toggleHighlight,
          handleDoubleClickOn: toggleHighlight,
          handleTripleClickOn: toggleHighlight,
        },
      }),
    ]
  },
})
