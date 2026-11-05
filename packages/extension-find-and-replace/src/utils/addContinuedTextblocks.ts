import type { Node as PMNode } from '@tiptap/pm/model'

import { hasBlockBetween } from '../search/has-block-between.js'
import { findAdjacentTextblock } from './findAdjacentTextblock.js'
import type { TextblockRange } from './types.js'

function findJoinedTextblock(
  doc: PMNode,
  textblock: TextblockRange,
  direction: 1 | -1,
  continuesNode: (node: PMNode) => boolean,
): TextblockRange | null {
  const adjacent = findAdjacentTextblock(doc, textblock, direction)

  if (!adjacent) {
    return null
  }

  const [first, second] = direction === 1 ? [textblock, adjacent] : [adjacent, textblock]

  if (!continuesNode(second.node) || hasBlockBetween(doc, first.to, second.from)) {
    return null
  }

  return adjacent
}

function addChain(
  doc: PMNode,
  textblock: TextblockRange,
  continuesNode: (node: PMNode) => boolean,
  found: Map<number, TextblockRange>,
): void {
  let previous = findJoinedTextblock(doc, textblock, -1, continuesNode)

  while (previous) {
    found.set(previous.pos, previous)
    previous = findJoinedTextblock(doc, previous, -1, continuesNode)
  }

  let next = findJoinedTextblock(doc, textblock, 1, continuesNode)

  while (next) {
    found.set(next.pos, next)
    next = findJoinedTextblock(doc, next, 1, continuesNode)
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
    // Its whole chain was already added
    if (found.has(textblock.pos)) {
      return
    }

    found.set(textblock.pos, textblock)
    addChain(doc, textblock, continuesNode, found)
  })

  return [...found.values()].sort((first, second) => first.pos - second.pos)
}
