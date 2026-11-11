import type { Transaction } from '@tiptap/pm/state'
import { AllSelection, EditorState, TextSelection } from '@tiptap/pm/state'

// Simulate deleting the selection without mutating `tr`, which may be shared across commands.
export function previewDeleteSelection(tr: Transaction): Transaction | null {
  const { selection } = tr

  if (selection instanceof TextSelection && selection.empty) {
    return null
  }

  if (!(selection instanceof TextSelection || selection instanceof AllSelection)) {
    return null
  }

  return EditorState.create({ doc: tr.doc, selection }).tr.deleteSelection()
}
