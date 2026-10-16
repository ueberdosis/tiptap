import { NodeSelection, type Selection, TextSelection, type Transaction } from '@tiptap/pm/state'

/**
 * Restore `selection` on `tr.doc` moved by `offset` positions. Use after
 * relocating the content the selection sits in.
 */
export function shiftSelection(tr: Transaction, selection: Selection, offset: number) {
  if (selection instanceof NodeSelection) {
    tr.setSelection(NodeSelection.create(tr.doc, selection.from + offset))
    return
  }

  const $anchor = tr.doc.resolve(selection.anchor + offset)
  const $head = tr.doc.resolve(selection.head + offset)

  tr.setSelection(TextSelection.between($anchor, $head))
}
