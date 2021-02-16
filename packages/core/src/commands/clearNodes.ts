import { liftTarget } from 'prosemirror-transform'
import { Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    clearNodes: {
      /**
       * Normalize nodes to a simple paragraph.
       */
      clearNodes: () => Command,
    }
  }
}

export const clearNodes: Commands['clearNodes'] = () => ({ state, tr, dispatch }) => {
  const { selection } = tr
  const { from, to } = selection

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.type.isText) {
      const fromPos = tr.doc.resolve(tr.mapping.map(pos + 1))
      const toPos = tr.doc.resolve(tr.mapping.map(pos + node.nodeSize - 1))
      const nodeRange = fromPos.blockRange(toPos)

      if (nodeRange) {
        const targetLiftDepth = liftTarget(nodeRange)

        if (node.type.isTextblock && dispatch) {
          tr.setNodeMarkup(nodeRange.start, state.doc.type.contentMatch.defaultType)
        }

        if ((targetLiftDepth || targetLiftDepth === 0) && dispatch) {
          tr.lift(nodeRange, targetLiftDepth)
        }
      }
    }
  })

  return true
}
