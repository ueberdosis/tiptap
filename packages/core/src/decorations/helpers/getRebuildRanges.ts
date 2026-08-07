import type { Node } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'

import { getChangedRanges } from '../../helpers/getChangedRanges.js'
import type { Range } from '../../types.js'
import { hasResolvableChangedRange } from './hasResolvableChangedRange.js'
import { isAttrStep } from './isAttrStep.js'

export type RebuildRangeResolution = { type: 'ranges'; ranges: Range[] } | { type: 'full' }

/**
 * Expands a changed range to the top-level blocks it touches. Blocks are
 * ordered, so the walk stops as soon as it passes the range.
 */
function blockRangeFor(doc: Node, changed: Range): Range | null {
  let from: number | null = null
  let to = 0
  let nodeStart = 0

  for (let index = 0; index < doc.childCount; index += 1) {
    if (nodeStart > changed.to) {
      break
    }

    const nodeEnd = nodeStart + doc.child(index).nodeSize

    // A block ending exactly at `changed.from` still owns decorations that
    // span the boundary, so it counts as overlapping.
    if (nodeEnd >= changed.from) {
      if (from === null) {
        from = nodeStart
      }

      to = nodeEnd
    }

    nodeStart = nodeEnd
  }

  return from === null ? null : { from, to }
}

/**
 * Returns the top-level block ranges to recompute after a transaction,
 * or `{ type: 'full' }` when the whole document must be rebuilt.
 * @param tr The transaction to inspect.
 * @param doc The new document after the transaction.
 * @returns The block ranges to recompute, or a full-recompute signal.
 */
export function getRebuildRanges(tr: Transaction, doc: Node): RebuildRangeResolution {
  // If any step cannot be resolved, fall back to full recompute.
  if (tr.steps.some(step => !hasResolvableChangedRange(step))) {
    return { type: 'full' }
  }

  const newRanges: Range[] = getChangedRanges(tr).map(({ newRange }) => newRange)

  // An AttrStep maps no position, so getChangedRanges misses it.
  tr.steps.forEach((step, index) => {
    if (!isAttrStep(step)) {
      return
    }

    const mapping = tr.mapping.slice(index)

    newRanges.push({ from: mapping.map(step.pos, -1), to: mapping.map(step.pos + 1) })
  })

  const ranges: Range[] = []

  for (const newRange of newRanges) {
    const blockRange = blockRangeFor(doc, newRange)

    if (blockRange) {
      ranges.push(blockRange)
    }
  }

  ranges.sort((a, b) => a.from - b.from)

  const merged: Range[] = []

  // for each range, merge it with the previous range if it overlaps
  for (const range of ranges) {
    const last = merged[merged.length - 1]

    // if the current range overlaps with the previous range, merge it
    if (last && range.from <= last.to) {
      last.to = Math.max(last.to, range.to)
    } else {
      merged.push({ ...range })
    }
  }

  return { type: 'ranges', ranges: merged }
}
