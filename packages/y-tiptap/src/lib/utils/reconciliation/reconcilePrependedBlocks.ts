import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import type { PrependedBlock } from '../../../types/PrependedBlock.js'
import type { Node, ResolvedPos } from 'prosemirror-model'
import * as Y from 'yjs'
import { marksToAttributes } from '../conversion/marksToAttributes.js'
import { normalizePNodeContent } from '../conversion/normalizePNodeContent.js'
import { equalYTypePNode } from './equalYTypePNode.js'
import { insertPChildren } from './insertPChildren.js'

const retainsOriginalSiblings = (
  before: ResolvedPos,
  after: ResolvedPos,
  firstInserted: number,
  recreated?: ReadonlyMap<number, Node>,
) => {
  for (let depth = 0; depth < before.depth; depth += 1) {
    const previous = before.node(depth).content.content
    const children = after.node(depth).content.content
    const current =
      recreated && depth === before.depth - 1
        ? children.map((node, index) => recreated.get(index) ?? node)
        : children
    const retained = after.index(depth)
    const expected = previous.slice()
    if (!expected[before.index(depth)].sameMarkup(current[retained])) {
      return false
    }
    expected[before.index(depth)] = current[retained]

    const originalNodes = new Set(previous)
    if (
      depth === before.depth - 1 &&
      current.slice(firstInserted, retained).some(node => originalNodes.has(node))
    ) {
      return false
    }

    const present = current.filter((node, index) => index === retained || originalNodes.has(node))
    if (
      present.length !== expected.length ||
      present.some((node, index) => node !== expected[index])
    ) {
      return false
    }
  }

  return true
}

const matchesInsertedChildren = (
  children: readonly Node[],
  firstPosition: number,
  block: PrependedBlock,
) => {
  const { insertedChildren } = block
  if (!insertedChildren || insertedChildren.length !== children.length) {
    return false
  }

  let position = firstPosition
  return children.every((child, index) => {
    const { from, to } = insertedChildren[index]
    const start = position
    position += child.nodeSize
    return from === start && to === position
  })
}

const prepareSiblingsForReconciliation = (
  children: readonly Node[],
  inserted: ResolvedPos,
  after: ResolvedPos,
  block: PrependedBlock,
  parent: Y.XmlFragment,
  meta: BindingMetadata,
) => {
  const matches = matchesInsertedChildren(children, inserted.before(), block)
  if (matches && block.originalSiblings) {
    return true
  }

  if (
    (matches || block.startsTransaction) &&
    retainsOriginalSiblings(block.before, after, inserted.index(-1))
  ) {
    return true
  }

  return matches && retainRecreatedSiblings(parent, block.before, after, inserted.index(-1), meta)
}

const retainRecreatedSiblings = (
  parent: Y.XmlFragment,
  before: ResolvedPos,
  after: ResolvedPos,
  firstInserted: number,
  meta: BindingMetadata,
) => {
  const original = before.node(-1).content.content
  const current = after.node(-1).content.content
  const firstSibling = before.index(-1) + 1
  const shift = current.length - original.length
  const recreated = new Map<number, Node>()
  const anchors = new Map<Y.XmlElement, Node>()

  for (let index = firstSibling; index < original.length; index += 1) {
    const replacement = current[index + shift]
    if (replacement === original[index]) {
      continue
    }
    const element = parent.get(index)
    if (
      index + shift <= after.index(-1) ||
      !replacement?.eq(original[index]) ||
      !(element instanceof Y.XmlElement) ||
      meta.mapping.get(element) !== original[index]
    ) {
      return false
    }
    recreated.set(index + shift, original[index])
    anchors.set(element, replacement)
  }

  if (anchors.size === 0 || !retainsOriginalSiblings(before, after, firstInserted, recreated)) {
    return false
  }

  anchors.forEach((node, element) => meta.mapping.set(element, node))
  return true
}

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

  const children = after.node(-1).content.content.slice(firstInserted, end)
  if (!prepareSiblingsForReconciliation(children, inserted, after, block, parent, meta)) {
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
  insertPChildren(parent, start, children, 0, children.length, meta)
}
