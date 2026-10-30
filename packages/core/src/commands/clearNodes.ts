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

    // map the position through the transaction
    // earlier commands may have already changed the document
    const startMapsLength = tr.mapping.maps.length

    ranges.forEach(({ $from, $to }) => {
      const from = $from.pos
      const to = $to.pos

      // a lift can only run once the nesting above it is gone, so the number of
      // sweeps is bounded by how deep the range is
      const depthMapping = tr.mapping.slice(startMapsLength)
      let maxSweeps = 1

      tr.doc.nodesBetween(depthMapping.map(from), depthMapping.map(to), (_node, pos) => {
        maxSweeps = Math.max(maxSweeps, tr.doc.resolve(pos).depth + 1)
      })

      // keep sweeping until no more lifts become valid
      // earlier lifts can make nested items liftable
      for (let sweep = 0; sweep < maxSweeps; sweep += 1) {
        const docBefore = tr.doc
        const sweepMapsLength = tr.mapping.maps.length
        const rangeMapping = tr.mapping.slice(startMapsLength)

        // rebuild the mapping after each sweep changes the document
        // positions still refer to `docBefore`
        let cachedMapsLength = sweepMapsLength
        let sweepMapping = tr.mapping.slice(sweepMapsLength)

        const mappedFrom = rangeMapping.map(from)
        const mappedTo = rangeMapping.map(to)

        docBefore.nodesBetween(mappedFrom, mappedTo, (node, pos) => {
          if (node.type.isText) {
            return
          }

          if (tr.mapping.maps.length !== cachedMapsLength) {
            cachedMapsLength = tr.mapping.maps.length
            sweepMapping = tr.mapping.slice(sweepMapsLength)
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

            // skip nodes that already have the default markup
            // invalid nodes may throw after an earlier lift
            if (
              defaultType &&
              target &&
              !target.hasMarkup(defaultType) &&
              defaultType.validContent(target.content)
            ) {
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
