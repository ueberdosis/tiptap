import type { Node } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'

import { getChangedRanges } from '../../helpers/getChangedRanges.js'
import type { Range } from '../../types.js'
import { hasResolvableChangedRange } from './hasResolvableChangedRange.js'

export type ChangedRangeResolution = { type: 'ranges'; ranges: Range[] } | { type: 'full' }

/**
 * Get block-aligned changed ranges from a transaction.
 * @param tr The transaction to get the changed ranges from.
 * @param doc The document to get the changed ranges from.
 * @returns The changed ranges.
 */
export function getBlockAlignedChangedRanges(tr: Transaction, doc: Node): ChangedRangeResolution {
  // If any step cannot be resolved, fall back to full recompute
  if (tr.steps.some(step => !hasResolvableChangedRange(step))) {
    return { type: 'full' }
  }
  const ranges: Range[] = []

  for (const { newRange } of getChangedRanges(tr)) {
    let from: number | null = null
    let to = 0

    doc.forEach((node, offset) => {
      const nodeStart = offset
      const nodeEnd = offset + node.nodeSize

      // if the node overlaps with the changed range
      if (nodeEnd >= newRange.from && nodeStart <= newRange.to) {
        if (from === null) {
          from = nodeStart
        }

        to = nodeEnd
      }
    })

    // if we found a block that overlaps with the changed range, add it to the ranges
    if (from !== null) {
      ranges.push({ from, to })
    }
  }

  ranges.sort((a, b) => a.from - b.from)

  const merged: Range[] = []

  // for each range, merge it with the previous range if it overlaps
  for (const range of ranges) {
    const last = merged[merged.length - 1]

    // if the current range overlaps with the previous range, merge them
    if (last && range.from <= last.to) {
      last.to = Math.max(last.to, range.to)
    } else {
      merged.push({ ...range })
    }
  }

  return { type: 'ranges', ranges: merged }
}
