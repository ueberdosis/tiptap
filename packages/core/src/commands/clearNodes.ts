import { liftTarget } from 'prosemirror-transform'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    clearNodes: {
      /**
       * Normalize nodes to a simple paragraph.
       */
      clearNodes: () => Command,
    }
  }
}

export const clearNodes: RawCommands['clearNodes'] = () => ({ state, tr, dispatch }) => {
  const { selection } = tr
  const { ranges } = selection

  ranges.forEach(range => {
    state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
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
  })

  return true
}
