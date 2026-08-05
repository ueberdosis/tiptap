import type { Transaction } from '@tiptap/pm/state'
import { Selection } from '@tiptap/pm/state'
import { ReplaceAroundStep, ReplaceStep } from '@tiptap/pm/transform'

// source: https://github.com/ProseMirror/prosemirror-state/blob/master/src/selection.js#L466
/**
 * Move the selection to the end of the content inserted by the last steps.
 * @param startLen How many steps the transaction had before the insertion.
 * @param bias Which side to prefer when the position is ambiguous.
 */
export function selectionToInsertionEnd(tr: Transaction, startLen: number, bias: number) {
  const last = tr.steps.length - 1

  if (last < startLen) {
    return
  }

  const step = tr.steps[last]

  if (!(step instanceof ReplaceStep || step instanceof ReplaceAroundStep)) {
    return
  }

  const map = tr.mapping.maps[last]
  let end = 0

  map.forEach((_from, _to, _newFrom, newTo) => {
    if (end === 0) {
      end = newTo
    }
  })

  tr.setSelection(Selection.near(tr.doc.resolve(end), bias))
}
