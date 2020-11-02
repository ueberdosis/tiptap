import { liftTarget } from 'prosemirror-transform'
import { Command } from '../Editor'
import { createExtension } from '../Extension'

export const ClearNodes = createExtension({
  addCommands() {
    return {
      clearNodes: (): Command => ({ state, tr, dispatch }) => {
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
                tr.setNodeMarkup(nodeRange.start, state.schema.nodes.paragraph)
              }

              if ((targetLiftDepth || targetLiftDepth === 0) && dispatch) {
                tr.lift(nodeRange, targetLiftDepth)
              }
            }
          }
        })

        return true
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    ClearNodes: typeof ClearNodes,
  }
}
