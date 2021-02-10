import { liftTarget } from 'prosemirror-transform'
import { Command, Commands } from '../types'

/**
 * Normalize nodes to a simple paragraph.
 */
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

declare module '@tiptap/core' {
  interface Commands {
    clearNodes: () => Command,
  }
}
