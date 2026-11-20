import type { Transaction } from 'prosemirror-state'
import type { ResolvedPos } from 'prosemirror-model'
import { ReplaceStep } from 'prosemirror-transform'
import type { PrependedBlock } from '../../../types/PrependedBlock.js'

const getInsertedBlocks = (
  first: ResolvedPos,
  retained: ResolvedPos,
): NonNullable<PrependedBlock['insertedChildren']> => {
  if (
    first.depth === 0 ||
    first.depth !== retained.depth ||
    first.start(-1) !== retained.start(-1)
  ) {
    return []
  }

  return first.node(-1).content.content.slice(first.index(-1), retained.index(-1))
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
    return {
      ...previous,
      inserted: transaction.mapping.map(previous.inserted, -1),
      start: transaction.mapping.map(previous.start, 1),
      end: transaction.mapping.map(previous.end, -1),
    }
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
    const remaining = mapping.slice(index)
    const block: PrependedBlock = {
      before,
      inserted: remaining.map(atStep.pos, -1),
      start: remaining.map(atStep.pos, 1),
      end: remaining.map(atStep.end(), -1),
    }
    if (index === 0) {
      return block
    }

    const stepMap = mapping.maps[index]
    const afterStep = transaction.docs[index + 1] ?? transaction.doc
    const insertedChildren = getInsertedBlocks(
      afterStep.resolve(stepMap.map(atStep.pos, -1)),
      afterStep.resolve(stepMap.map(atStep.pos, 1)),
    )
    if (insertedChildren.length > 0) {
      return { ...block, insertedChildren }
    }
  }

  return undefined
}
