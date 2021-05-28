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
      if (node.type.isText) {
        return
      }

      const $fromPos = tr.doc.resolve(tr.mapping.map(pos))
      const $toPos = tr.doc.resolve(tr.mapping.map(pos + node.nodeSize))
      const nodeRange = $fromPos.blockRange($toPos)

      if (!nodeRange) {
        return
      }

      const targetLiftDepth = liftTarget(nodeRange)

      if (node.type.isTextblock && dispatch) {
        const { defaultType } = $fromPos.parent.contentMatchAt($fromPos.index())

        tr.setNodeMarkup(nodeRange.start, defaultType)
      }

      if ((targetLiftDepth || targetLiftDepth === 0) && dispatch) {
        tr.lift(nodeRange, targetLiftDepth)
      }
    })
  })

  return true
}
