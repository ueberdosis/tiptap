import type { Transaction } from 'prosemirror-state'
import type { ResolvedPos } from 'prosemirror-model'
import { type Mapping, ReplaceStep } from 'prosemirror-transform'
import type { PrependedBlock } from '../../../types/PrependedBlock.js'

type InsertedChildren = NonNullable<PrependedBlock['insertedChildren']>

const getInsertedBlocks = (first: ResolvedPos, retained: ResolvedPos): InsertedChildren => {
  if (
    first.depth === 0 ||
    first.depth !== retained.depth ||
    first.start(-1) !== retained.start(-1)
  ) {
    return []
  }

  const parent = first.node(-1)
  let position = first.before()
  return parent.content.content.slice(first.index(-1), retained.index(-1)).map(child => {
    const from = position
    position += child.nodeSize
    return { from, to: position }
  })
}

const mapInsertedChildren = (children: InsertedChildren, mapping: Mapping) => {
  const mapped = []
  for (const child of children) {
    // A replacement of either outer token invalidates the tracked child.
    const from = mapping.mapResult(child.from, 1)
    const to = mapping.mapResult(child.to, -1)
    if (from.deleted || to.deleted) {
      return undefined
    }
    mapped.push({ from: from.pos, to: to.pos })
  }
  return mapped
}

const mapPrependedBlock = (block: PrependedBlock, mapping: Mapping): PrependedBlock | undefined => {
  const insertedChildren =
    block.insertedChildren && mapInsertedChildren(block.insertedChildren, mapping)
  if (!block.startsTransaction && !insertedChildren) {
    return undefined
  }

  return {
    ...block,
    insertedChildren,
    inserted: mapping.map(block.inserted, -1),
    start: mapping.map(block.start, 1),
    end: mapping.map(block.end, -1),
  }
}

const findOriginalBlock = (transaction: Transaction, index: number, atStep: ResolvedPos) => {
  const mapping = transaction.mapping
  const original = mapping
    .invert()
    .slice(mapping.maps.length - index)
    .mapResult(atStep.pos)
  if (original.deleted) {
    return undefined
  }

  const before = transaction.before.resolve(original.pos)
  if (before.parentOffset === 0 && before.parent.isTextblock && before.parent.content.size > 0) {
    return before
  }
  return undefined
}

export const trackPrependedBlock = (
  transaction: Transaction,
  previous?: PrependedBlock,
): PrependedBlock | undefined => {
  if (previous) {
    return mapPrependedBlock(previous, transaction.mapping)
  }

  for (const [index, step] of transaction.steps.entries()) {
    if (!(step instanceof ReplaceStep) || step.from !== step.to || step.slice.openStart === 0) {
      continue
    }

    const atStep = transaction.docs[index].resolve(step.from)
    if (atStep.parentOffset !== 0 || !atStep.parent.isTextblock) {
      continue
    }

    const before = findOriginalBlock(transaction, index, atStep)
    if (!before) {
      continue
    }

    const mapping = transaction.mapping
    const stepMap = mapping.maps[index]
    const remaining = mapping.slice(index + 1)
    const afterStep = transaction.docs[index + 1] ?? transaction.doc
    const block: PrependedBlock = {
      before,
      inserted: stepMap.map(atStep.pos, -1),
      startsTransaction: index === 0,
      start: stepMap.map(atStep.pos, 1),
      end: stepMap.map(atStep.end(), -1),
    }
    const insertedChildren = getInsertedBlocks(
      afterStep.resolve(block.inserted),
      afterStep.resolve(block.start),
    )
    if (block.startsTransaction || insertedChildren.length > 0) {
      return mapPrependedBlock({ ...block, insertedChildren }, remaining)
    }
  }

  return undefined
}
