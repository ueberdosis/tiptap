import type { Node as PMNode } from '@tiptap/pm/model'

import { findAdjacentTextblock } from './findAdjacentTextblock.js'
import type { TextblockRange } from './types.js'

function addChain(
  doc: PMNode,
  textblock: TextblockRange,
  continuesNode: (node: PMNode) => boolean,
  found: Map<number, TextblockRange>,
): void {
  let first: TextblockRange | null = textblock

  while (first && continuesNode(first.node)) {
    first = findAdjacentTextblock(doc, first, -1)

    if (first) {
      found.set(first.pos, first)
    }
  }

  let next = findAdjacentTextblock(doc, textblock, 1)

  while (next && continuesNode(next.node)) {
    found.set(next.pos, next)
    next = findAdjacentTextblock(doc, next, 1)
  }
}

/**
 * Adds the textblocks that are joined with the given ones by `continuesNode`.
 * @param doc The document the textblocks are in.
 * @param textblocks The textblocks in document order.
 * @param continuesNode Whether a textblock continues the one before it.
 * @returns The textblocks with their whole chains, in document order.
 */
export function addContinuedTextblocks(
  doc: PMNode,
  textblocks: readonly TextblockRange[],
  continuesNode: (node: PMNode) => boolean,
): TextblockRange[] {
  const found = new Map<number, TextblockRange>()

  textblocks.forEach(textblock => {
    found.set(textblock.pos, textblock)
    addChain(doc, textblock, continuesNode, found)
  })

  return [...found.values()].sort((first, second) => first.pos - second.pos)
}
