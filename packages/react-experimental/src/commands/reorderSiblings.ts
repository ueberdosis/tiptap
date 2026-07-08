import { Fragment } from '@tiptap/pm/model'
import type { Command } from '@tiptap/pm/state'

import type { ReactKeysPluginMeta } from '../plugins/reactKeys.js'
import { reactKeysPluginKey } from '../plugins/reactKeys.js'

/** True when `order` uses every integer index below its length exactly once. */
const isPermutation = (order: number[]): boolean => {
  const seen = new Set(order)

  return (
    seen.size === order.length &&
    order.every(index => Number.isInteger(index) && index >= 0 && index < order.length)
  )
}

/**
 * Reorders the children of the parent whose content starts at `start`.
 * `order[slot]` names the old index of the child that ends up at `slot`; to
 * swap the first two of three children, pass `[1, 0, 2]`.
 *
 * The replace step alone would make the reactKeys plugin drop every moved
 * node's key (mapping reports them deleted), so the command feeds it explicit
 * position overrides for each moved node and all of its descendants.
 */
export const reorderSiblings =
  (start: number, order: number[]): Command =>
  (state, dispatch) => {
    const $start = state.doc.resolve(start)

    if ($start.start() !== start) {
      return false
    }

    const parent = $start.parent

    if (order.length !== parent.childCount || !isPermutation(order)) {
      return false
    }

    const reordered = order.map(oldIndex => parent.child(oldIndex))

    // The parent's content expression may only allow this specific child
    // sequence; replaceWith would throw instead of failing the command
    if (!parent.canReplace(0, parent.childCount, Fragment.from(reordered))) {
      return false
    }
    if (!dispatch) {
      return true
    }

    const oldPositions: number[] = []

    parent.forEach((_child, offset) => oldPositions.push(start + offset))

    const overrides = new Map<number, number>()
    let newPos = start

    reordered.forEach((child, slot) => {
      const from = oldPositions[order[slot]]
      const delta = newPos - from

      overrides.set(from, newPos)
      // Descendants move by the same delta, so their keys survive too
      child.descendants((_descendant, relPos) => {
        overrides.set(from + 1 + relPos, from + 1 + relPos + delta)
        return true
      })
      newPos += child.nodeSize
    })

    const tr = state.tr.replaceWith(start, start + parent.content.size, reordered)

    tr.setMeta(reactKeysPluginKey, { overrides } satisfies ReactKeysPluginMeta)
    dispatch(tr)
    return true
  }
