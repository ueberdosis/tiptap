import type { Node } from '@tiptap/pm/model'
import type { Transaction } from '@tiptap/pm/state'
import type { Step } from '@tiptap/pm/transform'

import { getChangedRanges } from '../../helpers/getChangedRanges.js'
import type { Range } from '../../types.js'
import { hasResolvableChangedRange } from './hasResolvableChangedRange.js'

export type RebuildRangeResolution = { type: 'ranges'; ranges: Range[] } | { type: 'full' }

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

  tr.steps.forEach((step, index) => {
    // @ts-expect-error: ranges is not in StepMap's public type but is always present.
    if (step.getMap().ranges.length) return

    const { from, pos, to } = step as Step & { from?: number; pos?: number; to?: number }

    // from/to steps are already handled by getChangedRanges.
    if (from !== undefined || to !== undefined) return

    if (pos === undefined) return

    const newStart = tr.mapping.slice(index).map(pos, -1)
    const newEnd = tr.mapping.slice(index).map(pos + 1)

    newRanges.push({ from: newStart, to: newEnd })
  })

  const ranges: Range[] = []

  for (const newRange of newRanges) {
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

    // if the current range overlaps with the previous range, merge it
    if (last && range.from <= last.to) {
      last.to = Math.max(last.to, range.to)
    } else {
      merged.push({ ...range })
    }
  }

  return { type: 'ranges', ranges: merged }
}
