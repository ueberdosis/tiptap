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

    // The ranges point into the document as it is now, which is not always the
    // one the transaction started from: an earlier command in the same chain
    // may already have changed it. Map them from here on, not from the start.
    const commandStart = tr.mapping.maps.length

    ranges.forEach(({ $from, $to }) => {
      const from = $from.pos
      const to = $to.pos

      // A lift can only become legal once an earlier one has run: a list item
      // holding a nested list can't be lifted until that list is out of it. So
      // sweep until nothing changes. Each sweep either lifts something, which
      // makes the range shallower, or ends the loop.
      for (;;) {
        const docBefore = tr.doc
        const sweepStart = tr.mapping.maps.length
        const rangeMapping = tr.mapping.slice(commandStart)

        // Positions come from `docBefore`, so they need the steps this sweep
        // adds. Rebuild that mapping only when a step lands, not per node.
        let mappedThrough = sweepStart
        let sweepMapping = tr.mapping.slice(sweepStart)

        docBefore.nodesBetween(rangeMapping.map(from), rangeMapping.map(to), (node, pos) => {
          if (node.type.isText) {
            return
          }

          if (tr.mapping.maps.length !== mappedThrough) {
            mappedThrough = tr.mapping.maps.length
            sweepMapping = tr.mapping.slice(sweepStart)
          }

          const $mappedFrom = tr.doc.resolve(sweepMapping.map(pos))
          const $mappedTo = tr.doc.resolve(sweepMapping.map(pos + node.nodeSize))
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
