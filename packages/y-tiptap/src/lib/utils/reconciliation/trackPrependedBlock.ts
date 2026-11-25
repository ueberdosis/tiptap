import type { Transaction } from 'prosemirror-state'
import type { ResolvedPos } from 'prosemirror-model'
import type { Step } from 'prosemirror-transform'
import { Mapping, ReplaceAroundStep, ReplaceStep, StepMap } from 'prosemirror-transform'
import type { PrependedBlock } from '../../../types/PrependedBlock.js'

type BlockRanges = NonNullable<PrependedBlock['insertedChildren']>

const getInsertedBlocks = (first: ResolvedPos, retained: ResolvedPos): BlockRanges => {
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

const getOriginalSiblings = (before: ResolvedPos): BlockRanges => {
  const siblings: { from: number; to: number }[] = []
  for (let depth = 0; depth < before.depth; depth += 1) {
    const start = before.start(depth)
    const retained = before.index(depth)
    before.node(depth).forEach((child, offset, index) => {
      if (index !== retained) {
        const from = start + offset
        siblings.push({ from, to: from + child.nodeSize })
      }
    })
  }
  return siblings
}

const mapBlockRanges = (children: BlockRanges, mapping: Mapping): BlockRanges | undefined => {
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

const isMarkupChange = (step: Step) =>
  step instanceof ReplaceAroundStep &&
  step.gapFrom === step.from + 1 &&
  step.gapTo === step.to - 1 &&
  step.slice.size === 2 &&
  step.slice.content.size === 2 &&
  step.slice.content.firstChild?.isLeaf === false &&
  step.insert === 1

const getSiblingMapping = (transaction: Transaction): Mapping => {
  const mapping = new Mapping()
  transaction.steps.forEach((step, index) => {
    const mirror = transaction.mapping.getMirror(index)
    // Keep tracking siblings when only their markup changes.
    mapping.appendMap(
      isMarkupChange(step) ? StepMap.empty : transaction.mapping.maps[index],
      mirror !== undefined && mirror < index ? mirror : undefined,
    )
  })
  return mapping
}

const mapPrependedBlock = (
  block: PrependedBlock,
  transaction: Transaction,
  afterSplit?: number,
): PrependedBlock | undefined => {
  const mapping = transaction.mapping.slice(afterSplit)
  const insertedChildren = block.insertedChildren && mapBlockRanges(block.insertedChildren, mapping)
  if (!block.startsTransaction && !insertedChildren) {
    return undefined
  }

  const originalSiblings =
    afterSplit !== undefined && block.startsTransaction
      ? getOriginalSiblings(block.before)
      : block.originalSiblings

  return {
    ...block,
    insertedChildren,
    originalSiblings:
      originalSiblings && mapBlockRanges(originalSiblings, getSiblingMapping(transaction)),
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
    return mapPrependedBlock(previous, transaction)
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
      return mapPrependedBlock({ ...block, insertedChildren }, transaction, index + 1)
    }
  }

  return undefined
}
