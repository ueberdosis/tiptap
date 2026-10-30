import type { Node as PMNode } from '@tiptap/pm/model'
import type { Transform } from '@tiptap/pm/transform'
import { AttrStep } from '@tiptap/pm/transform'

import { findAdjacentTextblock } from './findAdjacentTextblock.js'
import type { TextblockRange } from './types.js'

function addTextblock(
  textblocks: Map<number, TextblockRange>,
  node: PMNode,
  pos: number,
): TextblockRange {
  const textblock = { node, pos, from: pos, to: pos + node.nodeSize }

  textblocks.set(pos, textblock)

  return textblock
}

// Attribute steps change no ranges, but can join or split a textblock and the one before it
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

    if (!node?.isTextblock) {
      return
    }

    const textblock = addTextblock(textblocks, node, pos)
    const previous = findAdjacentTextblock(doc, textblock, -1)

    if (previous) {
      textblocks.set(previous.pos, previous)
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
