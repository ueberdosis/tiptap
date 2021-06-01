import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-2'
import { Plugin } from 'prosemirror-state'

import CustomNodeView from './CustomNode.vue'

export default Node.create({
  name: 'customNode',
  isBlock: true,
  inline: false,
  group: 'block',
  draggable: true,
  isolating: true,
  defining: true,
  selectable: true,

  addAttributes() {
    return {
      nest: { default: false },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'custom-node',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['custom-node', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(CustomNodeView)
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleKeyDown: (view, event) => {
            // Prevent _any_ key from clearing block. As soon as you start typing,
            // and a block is focused, it'll blast the block away.
            view.state.typing = true
          },

          handlePaste: (view, event, slice) => {
            // Prevent pasting overwriting block
            view.state.pasting = true
          },
        },

        filterTransaction: (transaction, state) => {
          let result = true

          // Check if our flags are set, and if the selected node is a custom node
          if (state.typing || state.pasting) {
            transaction.mapping.maps.forEach(map => {
              map.forEach((oldStart, oldEnd, newStart, newEnd) => {
                state.doc.nodesBetween(
                  oldStart,
                  oldEnd,
                  (node, number, pos, parent, index) => {
                    if (node.type.name === 'customNode') {
                      result = false
                    }
                  },
                )
              })
            })
          }

          return result
        },
      }),
    ]
  },
})
