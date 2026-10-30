import type { Node as PMNode } from '@tiptap/pm/model'
import type { Transform } from '@tiptap/pm/transform'
import { AttrStep } from '@tiptap/pm/transform'

import type { TextblockRange } from './types.js'

function addTextblock(textblocks: Map<number, TextblockRange>, node: PMNode, pos: number): void {
  textblocks.set(pos, { node, pos, from: pos, to: pos + node.nodeSize })
}

// Attribute steps change no ranges, but can change whether a textblock continues another
function addAttributeChanges(
  doc: PMNode,
  transform: Transform,
  textblocks: Map<number, TextblockRange>,
): void {
  transform.steps.forEach((step, index) => {
    if (!(step instanceof AttrStep)) {
      return
    }

    const pos = transform.mapping.slice(index + 1).map(step.pos)
    const node = doc.nodeAt(pos)

    if (node?.isTextblock) {
      addTextblock(textblocks, node, pos)
    }
  })
}

export function getChangedTextblocks(doc: PMNode, transform: Transform): TextblockRange[] {
  const { mapping } = transform
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

        addTextblock(textblocks, node, pos)

        return false
      })
    })
  })

  addAttributeChanges(doc, transform, textblocks)

  return [...textblocks.values()].sort((first, second) => first.pos - second.pos)
}
