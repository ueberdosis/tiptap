import type { Node as PMNode } from '@tiptap/pm/model'

import { findNearestTextblock } from './findNearestTextblock.js'
import type { TextblockRange } from './types.js'

export function findAdjacentTextblock(
  doc: PMNode,
  textblock: TextblockRange,
  direction: 1 | -1,
): TextblockRange | null {
  const pos = direction === 1 ? textblock.to : textblock.from

  return findNearestTextblock(doc, pos, direction)
}
