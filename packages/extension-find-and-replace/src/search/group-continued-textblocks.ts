import type { Node as PMNode } from '@tiptap/pm/model'

import type { TextblockSearchTarget } from './types.js'

/**
 * Groups textblocks that continue the textblock before them in the list.
 * @param textblocks Whole chains of continued textblocks in document order.
 * @param continuesNode Whether a textblock continues the one before it.
 * @returns The groups to search as one text each.
 */
export function groupContinuedTextblocks(
  textblocks: readonly TextblockSearchTarget[],
  continuesNode: (node: PMNode) => boolean = () => false,
): TextblockSearchTarget[][] {
  const groups: TextblockSearchTarget[][] = []

  textblocks.forEach(textblock => {
    const group = groups.at(-1)

    if (group && continuesNode(textblock.node)) {
      group.push(textblock)
      return
    }

    groups.push([textblock])
  })

  return groups
}
