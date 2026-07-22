import type { Node } from '@tiptap/pm/model'
import type { Mapping } from '@tiptap/pm/transform'

import type { TextblockRange } from './types.js'

export function getChangedTextblocks(doc: Node, mapping: Mapping): TextblockRange[] {
  const textblocks = new Map<number, TextblockRange>()

  mapping.maps.forEach((stepMap, index) => {
    const remaining = mapping.slice(index + 1)

    stepMap.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
      const from = Math.max(0, remaining.map(newStart, -1) - 1)
      const to = Math.min(doc.content.size, remaining.map(newEnd, 1) + 1)

      doc.nodesBetween(from, to, (node, pos) => {
        if (!node.isTextblock) {
          return true
        }

        textblocks.set(pos, { node, pos, from: pos, to: pos + node.nodeSize })

        return false
      })
    })
  })

  return [...textblocks.values()].sort((first, second) => first.pos - second.pos)
}
