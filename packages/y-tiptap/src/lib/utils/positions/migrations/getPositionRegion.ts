import type { Node } from 'prosemirror-model'
import type { Transaction } from 'prosemirror-state'
import type { Step } from 'prosemirror-transform'
import type { PositionRegion } from '../../../../types/PositionMigration.js'
import type { ProsemirrorMapping } from '../../../../types/ProsemirrorMapping.js'
import type * as Y from 'yjs'
import { Mapping } from 'prosemirror-transform'

const getStepRange = (step: Step, doc: Node) => {
  const json = step.toJSON()

  switch (json.stepType) {
    case 'replace':
    case 'replaceAround':
    case 'addMark':
    case 'removeMark':
      return { from: json.from as number, to: json.to as number }
    case 'attr':
    case 'addNodeMark':
    case 'removeNodeMark': {
      const node = doc.nodeAt(json.pos)
      return node ? { from: json.pos as number, to: json.pos + node.nodeSize } : null
    }
    default:
      return null
  }
}

// Inline children share Yjs text types, so child indexes would not line up. A node object used
// twice lets reconciliation keep its Yjs element at either place.
const hasDistinctBlocks = (doc: Node) => {
  const children = new Set<Node>()
  let distinct = doc.childCount > 0
  doc.forEach(child => {
    distinct &&= !child.isInline && !children.has(child)
    children.add(child)
  })
  return distinct
}

/** The range in `source` that the transactions change, or null when it cannot be bounded. */
const getChangedRange = (source: Node, transactions: Transaction[]) => {
  const steps = transactions.flatMap(transaction =>
    transaction.steps.map((step, index) => ({ step, doc: transaction.docs[index] })),
  )
  const maps = transactions.flatMap(transaction => transaction.mapping.maps)
  let from = source.content.size
  let to = 0

  for (const [index, { step, doc }] of steps.entries()) {
    const range = getStepRange(step, doc)

    if (!range) {
      return null
    }

    const back = new Mapping(maps.slice(0, index)).invert()
    from = Math.min(from, back.map(range.from, -1))
    to = Math.max(to, back.map(range.to, 1))
  }

  return { from, to }
}

/** Counts the leading children that end before `position`, and where the next one starts. */
const getPrefix = (doc: Node, position: number) => {
  let count = 0
  let from = 0

  while (count < doc.childCount && from + doc.child(count).nodeSize <= position) {
    from += doc.child(count).nodeSize
    count += 1
  }

  return { count, from }
}

/** Counts the trailing children that start at or after `position`, leaving `start` children. */
const getSuffix = (doc: Node, position: number, start: number) => {
  let count = 0
  let to = doc.content.size

  while (
    count < doc.childCount - start &&
    to - doc.child(doc.childCount - count - 1).nodeSize >= position
  ) {
    to -= doc.child(doc.childCount - count - 1).nodeSize
    count += 1
  }

  return count
}

// Each top-level Yjs element must still be mapped to the node at its index.
const isSynced = (fragment: Y.XmlFragment, mapping: ProsemirrorMapping, doc: Node) => {
  const children = fragment.toArray()

  return (
    children.length === doc.childCount &&
    children.every((child, index) => mapping.get(child) === doc.child(index))
  )
}

const isRetained = (source: Node, target: Node, prefix: number, suffix: number) => {
  for (let index = 0; index < prefix; index += 1) {
    if (source.child(index) !== target.child(index)) {
      return false
    }
  }

  for (let index = 1; index <= suffix; index += 1) {
    if (source.child(source.childCount - index) !== target.child(target.childCount - index)) {
      return false
    }
  }

  return true
}

/**
 * Finds the top-level children that the transactions change. Children before and after them
 * must be the same nodes in both documents and mapped to their Yjs elements, so reconciliation
 * keeps those elements where they are.
 */
export const getPositionRegion = (
  source: Node,
  target: Node,
  transactions: Transaction[],
  fragment: Y.XmlFragment,
  mapping: ProsemirrorMapping,
): PositionRegion | null => {
  const changed =
    hasDistinctBlocks(source) && hasDistinctBlocks(target)
      ? getChangedRange(source, transactions)
      : null

  if (!changed || !isSynced(fragment, mapping, source)) {
    return null
  }

  const prefix = getPrefix(source, changed.from)
  const suffix = getSuffix(source, changed.to, prefix.count)

  // With fewer than two unchanged children, reconciliation matches by content and may reuse elements.
  if (
    prefix.count + suffix < 2 ||
    target.childCount - suffix < prefix.count ||
    !isRetained(source, target, prefix.count, suffix)
  ) {
    return null
  }

  return {
    from: prefix.from,
    start: prefix.count,
    sourceEnd: source.childCount - suffix,
    targetEnd: target.childCount - suffix,
  }
}
