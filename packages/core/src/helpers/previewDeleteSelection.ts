import type { Transaction } from '@tiptap/pm/state'
import { AllSelection, EditorState, TextSelection } from '@tiptap/pm/state'

import { deleteSelectionOnTransaction } from './deleteSelectionOnTransaction.js'

/**
 * Simulate deleting a non-empty text or all-document selection without mutating `tr`,
 * which may be shared across chained or fallback commands.
 * @param tr - The transaction whose selection deletion should be previewed
 * @returns A scratch transaction reflecting the deletion, or `null` when nothing would be deleted
 */
export function previewDeleteSelection(tr: Transaction): Transaction | null {
  const { selection } = tr

  if (selection instanceof TextSelection && selection.empty) {
    return null
  }

  if (!(selection instanceof TextSelection || selection instanceof AllSelection)) {
    return null
  }

  const previewTr = EditorState.create({
    doc: tr.doc,
    selection,
    storedMarks: tr.storedMarks,
  }).tr

  deleteSelectionOnTransaction(previewTr, tr.doc.type.schema)

  return previewTr
}
