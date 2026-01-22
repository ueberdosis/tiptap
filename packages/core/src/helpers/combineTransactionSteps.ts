import type { Node as ProseMirrorNode } from '@dibdab/pm/model'
import type { Transaction } from '@dibdab/pm/state'
import { Transform } from '@dibdab/pm/transform'

/**
 * Returns a new `Transform` based on all steps of the passed transactions.
 * @param oldDoc The Prosemirror node to start from
 * @param transactions The transactions to combine
 * @returns A new `Transform` with all steps of the passed transactions
 */
export function combineTransactionSteps(oldDoc: ProseMirrorNode, transactions: Transaction[]): Transform {
  const transform = new Transform(oldDoc)

  transactions.forEach(transaction => {
    transaction.steps.forEach(step => {
      transform.step(step)
    })
  })

  return transform
}
