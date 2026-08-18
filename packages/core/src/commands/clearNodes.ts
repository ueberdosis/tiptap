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

// Deeper than any realistic block nesting; see the loop below.
const MAX_PASSES = 20

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

      // A lift can become legal only once an earlier lift in the same
      // transaction has run: `listItem` is `paragraph block*`, so an item that
      // still holds a nested list cannot be lifted until that list is out of
      // it. Sweeping the range once therefore leaves the deepest items
      // wrapped, so repeat until the document settles. The cap is only a
      // runaway guard — the loop normally ends on the `eq` check.
      for (let pass = 0; pass < MAX_PASSES; pass += 1) {
        const docBefore = tr.doc
        // Positions below are resolved against `docBefore`, so they must be
        // mapped through the steps this pass adds — not the whole transaction.
        const passMappingStart = tr.mapping.maps.length

        docBefore.nodesBetween(tr.mapping.map(from), tr.mapping.map(to), (node, pos) => {
          if (node.type.isText) {
            return
          }

          const mapping = tr.mapping.slice(passMappingStart)
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

            // Earlier lifts can leave this position on a node that cannot hold
            // its own content as the default type, which `setNodeMarkup`
            // rejects with `RangeError: Invalid content for node type`.
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
