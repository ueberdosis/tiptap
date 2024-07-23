import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Transaction } from '@tiptap/pm/state'
import { Transform } from '@tiptap/pm/transform'

/**
 * Returns a new `Transform` based on all steps of the passed transactions.
 * @param oldDoc The Prosemirror node to start from
 * @param transactions The transactions to combine
 * @returns A new `Transform` with all steps of the passed transactions
 */
export function combineTransactionSteps(
  oldDoc: ProseMirrorNode,
  transactions: Transaction[],
): Transform {
  const transform = new Transform(oldDoc)

  transactions.forEach(transaction => {
    transaction.steps.forEach(step => {
      transform.step(step)
    })
  })

  return transform
}
