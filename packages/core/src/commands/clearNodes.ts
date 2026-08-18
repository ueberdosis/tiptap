import { liftTarget } from '@tiptap/pm/transform'

import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clearNodes: {
      /**
       * Normalize nodes to a simple paragraph.
       * @example editor.commands.clearNodes()
       */
      clearNodes: () => ReturnType
    }
  }
}

export const clearNodes: RawCommands['clearNodes'] =
  () =>
  ({ tr, dispatch }) => {
    const { selection } = tr
    const { ranges } = selection

    if (!dispatch) {
      return true
    }

    ranges.forEach(({ $from, $to }) => {
      const from = $from.pos
      const to = $to.pos

      // A lift can only become legal once an earlier one has run: a list item
      // holding a nested list can't be lifted until that list is out of it. So
      // sweep until nothing changes. Every sweep either lifts something, which
      // makes the range shallower, or ends the loop.
      for (;;) {
        const docBefore = tr.doc
        // Positions below come from `docBefore`, so map them through this
        // sweep's steps only, not the whole transaction.
        const sweepStart = tr.mapping.maps.length

        docBefore.nodesBetween(tr.mapping.map(from), tr.mapping.map(to), (node, pos) => {
          if (node.type.isText) {
            return
          }

          const mapping = tr.mapping.slice(sweepStart)
          const $mappedFrom = tr.doc.resolve(mapping.map(pos))
          const $mappedTo = tr.doc.resolve(mapping.map(pos + node.nodeSize))
          const nodeRange = $mappedFrom.blockRange($mappedTo)

          if (!nodeRange) {
            return
          }

          const targetLiftDepth = liftTarget(nodeRange)

          if (node.type.isTextblock) {
            const { defaultType } = $mappedFrom.parent.contentMatchAt($mappedFrom.index())
            const target = tr.doc.nodeAt(nodeRange.start)

            // An earlier lift can leave this position on a node that cannot
            // hold its own content as the default type, which would throw.
            if (defaultType && target && defaultType.validContent(target.content)) {
              tr.setNodeMarkup(nodeRange.start, defaultType)
            }
          }

          if (targetLiftDepth || targetLiftDepth === 0) {
            tr.lift(nodeRange, targetLiftDepth)
          }
        })

        if (tr.doc.eq(docBefore)) {
          break
        }
      }
    })

    return true
  }
