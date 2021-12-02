import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Transaction } from 'prosemirror-state'
import { Transform } from 'prosemirror-transform'

/**
 * Returns a new `Transform` based on all steps of the passed transactions.
 */
export default function combineTransactionSteps(oldDoc: ProseMirrorNode, transactions: Transaction[]): Transform {
  const transform = new Transform(oldDoc)

  transactions.forEach(transaction => {
    transaction.steps.forEach(step => {
      transform.step(step)
    })
  })

  return transform
}
