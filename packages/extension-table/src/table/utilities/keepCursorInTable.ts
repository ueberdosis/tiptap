import { findParentNodeClosestToPos } from '@tiptap/core'
import { TextSelection, type Transaction } from '@tiptap/pm/state'

// prosemirror-tables does not move the selection after a deletion, so removing the
// last row or column can push the cursor out of the table into the content below.
export function keepCursorInTable(tr: Transaction, tablePos: number) {
  const mappedTablePos = tr.mapping.map(tablePos)

  // The delete can push the cursor into a following table, so compare the
  // mapped position to confirm it is still the table we edited.
  const stillInTable = findParentNodeClosestToPos(
    tr.selection.$from,
    node => node.type.name === 'table',
  )

  if (stillInTable?.pos === mappedTablePos) {
    return
  }

  const tableNode = tr.doc.nodeAt(mappedTablePos)

  if (!tableNode) {
    return
  }

  const endOfTable = mappedTablePos + tableNode.nodeSize - 1

  tr.setSelection(TextSelection.near(tr.doc.resolve(endOfTable), -1))
}
