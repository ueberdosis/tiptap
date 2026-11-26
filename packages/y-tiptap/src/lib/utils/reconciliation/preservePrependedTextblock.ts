import type { Transaction } from 'prosemirror-state'
import type { Node, ResolvedPos } from 'prosemirror-model'
import { Mapping, ReplaceStep } from 'prosemirror-transform'
import * as Y from 'yjs'
import type { BindingMetadata } from '../../../types/BindingMetadata.js'
import { marksToAttributes } from '../conversion/marksToAttributes.js'
import { normalizePNodeContent } from '../conversion/normalizePNodeContent.js'
import { equalYTypePNode } from './equalYTypePNode.js'
import { insertPChildren } from './insertPChildren.js'

const findAddedChildren = (before: Node, after: Node, beforeIndex: number, afterIndex: number) => {
  if (!before.sameMarkup(after) || after.childCount < before.childCount) {
    return undefined
  }

  const previous = before.content.content
  const current = after.content.content
  const original = new Set(previous)
  const additions: { index: number; node: Node }[] = []
  let index = 0
  for (const [newIndex, node] of current.entries()) {
    const retained = newIndex === afterIndex
    if (retained || node === previous[index]) {
      if (retained !== (index === beforeIndex)) {
        return undefined
      }
      index += 1
    } else if (original.has(node)) {
      return undefined
    } else {
      additions.push({ index: newIndex, node })
    }
  }
  return index === previous.length ? additions : undefined
}

const findStepTextblockStart = (transaction: Transaction, index: number) => {
  const step = transaction.steps[index]
  if (!(step instanceof ReplaceStep)) {
    return undefined
  }

  const before = transaction.docs[index].resolve(step.to)
  if (
    !before.parent.isTextblock ||
    before.parentOffset !== 0 ||
    (step.from === step.to ? step.slice.openStart === 0 : step.from !== before.before())
  ) {
    return undefined
  }
  return before
}

const findTextblockStart = (transaction: Transaction) => {
  const mapping = transaction.mapping
  for (let index = 0; index < transaction.steps.length; index += 1) {
    const before = findStepTextblockStart(transaction, index)
    if (!before?.parent.content.size) {
      continue
    }
    if (index === 0) {
      return before
    }
    const position = mapping
      .invert()
      .slice(mapping.maps.length - index)
      .mapResult(before.pos, 1)
    if (position.deleted) {
      continue
    }
    const original = transaction.before.resolve(position.pos)
    if (original.parentOffset === 0 && original.parent.eq(before.parent)) {
      return original
    }
  }
  return undefined
}

const findRetainedTextblock = (document: Node, transactions: readonly Transaction[]) => {
  const before = findTextblockStart(transactions[0])
  if (!before) {
    return undefined
  }
  const mapping = new Mapping()
  transactions.forEach(change => mapping.appendMapping(change.mapping))
  const startResult = mapping.mapResult(before.pos, 1)
  const endResult = mapping.mapResult(before.end(), -1)
  if (startResult.deleted || endResult.deleted) {
    return undefined
  }
  const after = document.resolve(startResult.pos)
  if (
    after.depth !== before.depth ||
    !after.parent.sameMarkup(before.parent) ||
    after.end() !== endResult.pos ||
    !after.parent.content.cut(after.parentOffset).eq(before.parent.content)
  ) {
    return undefined
  }

  return { before, after }
}

const planInsertions = (
  root: Y.XmlFragment,
  before: ResolvedPos,
  after: ResolvedPos,
  meta: BindingMetadata,
) => {
  let parent = root
  let original: Y.XmlElement | undefined
  const plans = []
  for (let depth = 0; depth < before.depth; depth += 1) {
    const oldIndex = before.index(depth)
    const newIndex = after.index(depth)
    const next = after.node(depth)
    const additions = findAddedChildren(before.node(depth), next, oldIndex, newIndex)
    const child = parent.get(oldIndex)
    if (
      !additions ||
      !(child instanceof Y.XmlElement) ||
      meta.mapping.get(child) !== before.node(depth + 1)
    ) {
      return undefined
    }
    plans.push({ parent, next, additions })
    parent = child
    original = child
  }
  return { original, plans }
}

export const preservePrependedTextblock = (
  root: Y.XmlFragment,
  document: Node,
  transactions: readonly Transaction[],
  meta: BindingMetadata,
) => {
  const retained = findRetainedTextblock(document, transactions)
  if (!retained) {
    return false
  }
  const { before, after } = retained
  const plan = planInsertions(root, before, after, meta)
  if (!plan?.original || !equalYTypePNode(plan.original, before.parent)) {
    return false
  }
  const { original, plans } = plan
  if (!plans.at(-1)?.additions.some(({ index }) => index < after.index(-1))) {
    return false
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
  meta.mapping.set(original, after.parent)
  for (const { parent, next, additions } of plans) {
    for (const { index, node } of additions) {
      insertPChildren(parent, index, [node], 0, 1, meta)
    }
    meta.mapping.set(parent, next)
  }
  return true
}
