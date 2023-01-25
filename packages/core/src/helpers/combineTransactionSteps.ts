import { Transform } from '@tiptap/pm/transform'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Transaction } from 'prosemirror-state'

/**
 * Returns a new `Transform` based on all steps of the passed transactions.
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
