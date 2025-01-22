import { RemoveMarkStep } from '@tiptap/pm/transform'

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
          nextTransaction.before.nodesBetween(change.oldRange.from, change.oldRange.to, (node, from) => {
            const to = from + node.nodeSize - 2
            const isFullyWithinRange = change.oldRange.from <= from && to <= change.oldRange.to

            this.editor.emit('delete', {
              type: 'node',
              node,
              from,
              to,
              newFrom: nextTransaction.mapping.map(from),
              newTo: nextTransaction.mapping.map(to),
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

      const mapping = nextTransaction.mapping
      nextTransaction.steps.forEach((step, index) => {
        if (step instanceof RemoveMarkStep) {
          const newStart = mapping.slice(index).map(step.from, -1)
          const newEnd = mapping.slice(index).map(step.to)
          const oldStart = mapping.invert().map(newStart, -1)
          const oldEnd = mapping.invert().map(newEnd)

          const foundBeforeMark = nextTransaction.doc.nodeAt(newStart - 1)?.marks.some(mark => mark.eq(step.mark))
          const foundAfterMark = nextTransaction.doc.nodeAt(newEnd)?.marks.some(mark => mark.eq(step.mark))

          this.editor.emit('delete', {
            type: 'mark',
            mark: step.mark,
            from: step.from,
            to: step.to,
            deletedRange: {
              from: oldStart,
              to: oldEnd,
            },
            newRange: {
              from: newStart,
              to: newEnd,
            },
            partial: Boolean(foundAfterMark || foundBeforeMark),
            editor: this.editor,
            transaction,
            combinedTransform: nextTransaction,
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
