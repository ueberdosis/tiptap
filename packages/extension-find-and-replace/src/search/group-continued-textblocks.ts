import type { Node as PMNode } from '@tiptap/pm/model'

import { hasBlockBetween } from './has-block-between.js'
import type { TextblockSearchTarget } from './types.js'

/**
 * Groups textblocks that continue the textblock before them in the list.
 * @param doc The document the textblocks are in.
 * @param textblocks Whole chains of continued textblocks in document order.
 * @param continuesNode Whether a textblock continues the one before it.
 * @returns The groups to search as one text each.
 */
export function groupContinuedTextblocks(
  doc: PMNode,
  textblocks: readonly TextblockSearchTarget[],
  continuesNode: (node: PMNode) => boolean = () => false,
): TextblockSearchTarget[][] {
  const groups: TextblockSearchTarget[][] = []

  textblocks.forEach(textblock => {
    const group = groups.at(-1)
    const previous = group?.at(-1)

    // A block between them would be deleted when a match across them is replaced
    if (
      group &&
      previous &&
      continuesNode(textblock.node) &&
      !hasBlockBetween(doc, previous.pos + previous.node.nodeSize, textblock.pos)
    ) {
      group.push(textblock)
      return
    }

    groups.push([textblock])
  })

  return groups
}
