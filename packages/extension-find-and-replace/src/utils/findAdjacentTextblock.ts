import type { Node as PMNode } from '@tiptap/pm/model'
import { Selection } from '@tiptap/pm/state'

import type { TextblockRange } from './types.js'

export function findAdjacentTextblock(
  doc: PMNode,
  textblock: TextblockRange,
  direction: 1 | -1,
): TextblockRange | null {
  const pos = direction === 1 ? textblock.to : textblock.from
  const selection = Selection.findFrom(doc.resolve(pos), direction, true)

  if (!selection) {
    return null
  }

  const node = selection.$from.parent
  const from = selection.$from.before()

  return { node, pos: from, from, to: from + node.nodeSize }
}
