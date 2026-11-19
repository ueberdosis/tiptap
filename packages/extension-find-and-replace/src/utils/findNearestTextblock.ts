import type { Node as PMNode } from '@tiptap/pm/model'
import { Selection } from '@tiptap/pm/state'

import type { TextblockRange } from './types.js'

export function findNearestTextblock(
  doc: PMNode,
  pos: number,
  direction: 1 | -1,
): TextblockRange | null {
  const selection = Selection.findFrom(doc.resolve(pos), direction, true)

  if (!selection) {
    return null
  }

  const node = selection.$from.parent
  const from = selection.$from.before()

  return { node, pos: from, from, to: from + node.nodeSize }
}
