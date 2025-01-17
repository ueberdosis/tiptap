import { combineTransactionSteps, Editor, Extension, getChangedRanges, Range } from '@tiptap/core'
import { Node } from '@tiptap/pm/model'
import { Transaction } from '@tiptap/pm/state'
import { Transform } from '@tiptap/pm/transform'

export interface OnDeleteOptions {
  /**
   * Whether to consider partial deletions as well
   * @default false
   */
  partial?: boolean

  /**
   * Whether the callback should be called asynchronously to avoid blocking the editor
   * @default false
   */
  async?: boolean

  /**
   * The callback which is called when the user deletes a node
   */
  onDelete: (ctx: {
    /**
     * The node which the deletion occurred in
     * @note This can be a parent node of the deleted content
     */
    node: Node
    /**
     * Whether the deletion was partial (only a part of this node was deleted)
     */
    partial: boolean
    /**
     * This is the position of the node in the document (before the deletion)
     */
    pos: number
    /**
     * The new position of the node in the document (after the deletion)
     */
    newPos: number
    /**
     * The range of the deleted content (before the deletion)
     */
    deletedRange: Range
    /**
     * The new range of positions of where the deleted content was in the new document (after the deletion)
     */
    newRange: Range
    /**
     * The editor instance
     */
    editor: Editor
    /**
     * The transaction that caused the deletion
     */
    transaction: Transaction
    /**
     * The combined transform (including all appended transactions) that caused the deletion
     */
    combinedTransform: Transform
  }) => void
}

/**
 * This extension allows you to be notified when the user deletes content you are interested in.
 * @see https://www.tiptap.dev/api/extensions/on-delete
 */
export const OnDelete = Extension.create<OnDeleteOptions>({
  name: 'onDelete',

  addOptions() {
    return {
      onDelete: () => {},
      async: false,
    }
  },

  onUpdate({ transaction, appendedTransactions }) {
    const callback = () => {
      const nextTransaction = combineTransactionSteps(transaction.before, [transaction, ...appendedTransactions])
      const changes = getChangedRanges(nextTransaction)

      changes.forEach(change => {
        if (
          nextTransaction.mapping.mapResult(change.oldRange.from).deletedAfter &&
          nextTransaction.mapping.mapResult(change.oldRange.to).deletedBefore
        ) {
          nextTransaction.before.nodesBetween(change.oldRange.from, change.oldRange.to, (node, pos) => {
            const isFullyWithinRange = change.oldRange.from <= pos && pos + node.nodeSize - 2 <= change.oldRange.to

            this.options.onDelete({
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

    if (this.options.async) {
      setTimeout(callback, 0)
    } else {
      callback()
    }
  },
})
