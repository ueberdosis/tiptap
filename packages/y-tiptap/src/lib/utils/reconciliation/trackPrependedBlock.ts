import type { Transaction } from 'prosemirror-state'
import { ReplaceStep } from 'prosemirror-transform'
import type { PrependedBlock } from '../../../types/PrependedBlock.js'

export const trackPrependedBlock = (
  transaction: Transaction,
  previous?: PrependedBlock,
): PrependedBlock | undefined => {
  if (previous) {
    return {
      before: previous.before,
      inserted: transaction.mapping.map(previous.inserted, -1),
      start: transaction.mapping.map(previous.start, 1),
      end: transaction.mapping.map(previous.end, -1),
    }
  }

  const step = transaction.steps[0]
  if (!(step instanceof ReplaceStep) || step.from !== step.to || step.slice.openStart === 0) {
    return undefined
  }

  const before = transaction.before.resolve(step.from)
  if (before.parentOffset !== 0 || !before.parent.isTextblock || before.parent.content.size === 0) {
    return undefined
  }

  return {
    before,
    inserted: transaction.mapping.map(before.pos, -1),
    start: transaction.mapping.map(before.pos, 1),
    end: transaction.mapping.map(before.end(), -1),
  }
}
