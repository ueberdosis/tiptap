import type { Node } from 'prosemirror-model'
import type { PositionRegion, PositionTransfer } from '../../../../types/PositionMigration.js'
import * as Y from 'yjs'
import { normalizePNodeContent } from '../../conversion/normalizePNodeContent.js'

const collectTransfers = (type: Y.XmlElement, node: Node, transfers: PositionTransfer[]) => {
  if (node.content.size === 0) {
    const element = type._item!.id

    type.toArray().forEach(child => {
      if (!(child instanceof Y.XmlText) || !child._item) {
        return
      }

      for (const boundary of ['start', 'end'] as const) {
        transfers.push({
          source: { ...child._item.id, length: 1, boundary },
          target: { client: element.client, clock: element.clock, type: null, boundary },
        })
      }
    })
    return
  }

  let hasElements = false
  node.forEach(child => {
    hasElements ||= !child.isText
  })

  // Text alone cannot contain an empty node.
  if (!hasElements) {
    return
  }

  const children = type.toArray()
  normalizePNodeContent(node).forEach((child, index) => {
    const shared = children[index]

    if (!Array.isArray(child) && !child.isLeaf && shared instanceof Y.XmlElement) {
      collectTransfers(shared, child, transfers)
    }
  })
}

/**
 * Keeps empty text boundaries in the unchanged children around `region` on their element, as a
 * whole-document migration does. Their text is not read.
 */
export const getRetainedEmptyTextTransfers = (
  fragment: Y.XmlFragment,
  doc: Node,
  region: PositionRegion | null,
) => {
  const transfers: PositionTransfer[] = []

  if (!region || fragment.length === 0) {
    return transfers
  }

  const children = fragment.toArray()
  doc.forEach((child, _, index) => {
    const shared = children[index]
    const retained = index < region.start || index >= region.sourceEnd

    if (retained && !child.isLeaf && shared instanceof Y.XmlElement) {
      collectTransfers(shared, child, transfers)
    }
  })

  return transfers
}
