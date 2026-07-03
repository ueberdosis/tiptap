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
  ({ state, tr, dispatch }) => {
    const { selection } = tr
    const { ranges } = selection

    if (!dispatch) {
      return true
    }

    ranges.forEach(({ $from, $to }) => {
      // Collect textblock positions from the original, unmutated doc first.
      // Wrapper/container nodes (list, listItem, taskList, taskItem, ...) are
      // intentionally skipped — nodesBetween walks every non-text node in the
      // range, and lifting those independently, on top of lifting their
      // textblock children in the same pass, mutates the doc mid-iteration
      // and invalidates the still-to-be-visited positions of other
      // descendants. Lifting a textblock all the way out of its ancestor
      // chain already removes now-empty wrappers as part of the same
      // transform step, so wrappers never need to be lifted separately.
      const textblockPositions: number[] = []

      state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
        if (node.type.isTextblock) {
          textblockPositions.push(pos)
        }
      })

      // Process in reverse document order. Lifting a deeper/later textblock
      // first (while ancestor nodes further up the doc are still intact)
      // lets `liftTarget` climb out of the full nesting chain in one shot.
      // Processing forward instead — as this used to — meant an earlier,
      // shallower textblock could get lifted first, changing its container's
      // shape before a still-to-be-processed deeper sibling's liftTarget was
      // computed, which could cap that later lift to a shallower depth than
      // it should reach (e.g. a nested taskList inside a taskItem only
      // getting lifted one level instead of all the way out).
      textblockPositions
        .slice()
        .reverse()
        .forEach(pos => {
          const { doc, mapping } = tr
          const $mappedFrom = doc.resolve(mapping.map(pos))
          const node = $mappedFrom.nodeAfter

          if (!node || !node.type.isTextblock) {
            return
          }

          const $mappedTo = doc.resolve(mapping.map(pos) + node.nodeSize)
          const nodeRange = $mappedFrom.blockRange($mappedTo)

          if (!nodeRange) {
            return
          }

          const targetLiftDepth = liftTarget(nodeRange)
          const { defaultType } = $mappedFrom.parent.contentMatchAt($mappedFrom.index())

          tr.setNodeMarkup(nodeRange.start, defaultType)

          if (targetLiftDepth || targetLiftDepth === 0) {
            tr.lift(nodeRange, targetLiftDepth)
          }
        })
    })

    return true
  }
