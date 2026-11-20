import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { PrependedBlock } from '../../../types/PrependedBlock.js'
import type { Node } from 'prosemirror-model'
import * as Y from 'yjs'
import { marksToAttributes } from '../conversion/marksToAttributes.js'
import { normalizePNodeContent } from '../conversion/normalizePNodeContent.js'
import { equalYTypePNode } from './equalYTypePNode.js'
import { insertPChildren } from './insertPChildren.js'

export const reconcilePrependedBlocks = (
  root: Y.XmlFragment,
  document: Node,
  block: PrependedBlock,
  meta: BindingMetadata,
) => {
  const { before } = block
  const after = document.resolve(block.start)
  const inserted = document.resolve(block.inserted)
  if (
    after.depth !== before.depth ||
    after.parent.type !== before.parent.type ||
    after.end() !== block.end ||
    inserted.depth !== after.depth ||
    inserted.start(-1) !== after.start(-1)
  ) {
    return
  }

  let parent = root
  for (let depth = 0; depth < before.depth - 1; depth += 1) {
    const index = before.index(depth)
    const child = parent.get(index)
    if (!(child instanceof Y.XmlElement) || index !== after.index(depth)) {
      return
    }
    parent = child
  }

  const start = before.index(before.depth - 1)
  const firstInserted = inserted.index(inserted.depth - 1)
  const end = after.index(after.depth - 1)
  const original = parent.get(start)

  if (
    end <= firstInserted ||
    !(original instanceof Y.XmlElement) ||
    meta.mapping.get(original) !== before.parent ||
    !after.parent.content.cut(after.parentOffset).eq(before.parent.content) ||
    !equalYTypePNode(original, before.parent)
  ) {
    return
  }

  if (after.parentOffset > 0) {
    const prefix = normalizePNodeContent(
      after.parent.copy(after.parent.content.cut(0, after.parentOffset)),
    )
    const trailingText = prefix.at(-1)
    const firstExisting = original.get(0)
    if (firstExisting instanceof Y.XmlText && Array.isArray(trailingText)) {
      prefix.pop()
      firstExisting.applyDelta(
        trailingText.map(node => ({
          insert: node.text ?? '',
          attributes: marksToAttributes(node.marks, meta),
        })),
      )
      meta.mapping.set(firstExisting, normalizePNodeContent(after.parent)[prefix.length])
    }
    insertPChildren(original, 0, prefix, 0, prefix.length, meta)
  }

  if (after.parent.sameMarkup(before.parent)) {
    meta.mapping.set(original, after.parent)
  }
  const children = Array.from({ length: end - firstInserted }, (_, index) =>
    after.node(after.depth - 1).child(firstInserted + index),
  )
  insertPChildren(parent, start, children, 0, children.length, meta)
}
