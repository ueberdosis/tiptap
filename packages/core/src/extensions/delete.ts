import { Extension } from '../Extension.js'
import { combineTransactionSteps, getChangedRanges } from '../helpers/index.js'

/**
 * This extension allows you to be notified when the user deletes content you are interested in.
 */
export const Delete = Extension.create({
  name: 'delete',

  onUpdate({ transaction, appendedTransactions }) {
    const callback = () => {
      if (
        this.editor.options.coreExtensionOptions?.delete?.filterTransaction?.(transaction) ??
        transaction.getMeta('y-sync$')
      ) {
        return
      }
      const nextTransaction = combineTransactionSteps(transaction.before, [transaction, ...appendedTransactions])
      const changes = getChangedRanges(nextTransaction)

      changes.forEach(change => {
        if (
          nextTransaction.mapping.mapResult(change.oldRange.from).deletedAfter &&
          nextTransaction.mapping.mapResult(change.oldRange.to).deletedBefore
        ) {
          nextTransaction.before.nodesBetween(change.oldRange.from, change.oldRange.to, (node, pos) => {
            const isFullyWithinRange = change.oldRange.from <= pos && pos + node.nodeSize - 2 <= change.oldRange.to

            this.editor.emit('delete', {
              node,
              pos,
              newPos: nextTransaction.mapping.map(pos),
              deletedRange: change.oldRange,
              newRange: change.newRange,
              partial: !isFullyWithinRange,
              editor: this.editor,
              transaction,
              combinedTransform: nextTransaction,
            })
          })
        }
      })
    }

    if (this.editor.options.coreExtensionOptions?.delete?.async ?? true) {
      setTimeout(callback, 0)
    } else {
      callback()
    }
  },
})
