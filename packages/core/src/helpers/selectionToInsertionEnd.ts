import { Selection, Transaction } from 'prosemirror-state'
import { ReplaceStep, ReplaceAroundStep } from 'prosemirror-transform'

// source: https://github.com/ProseMirror/prosemirror-state/blob/master/src/selection.js#L466
export default function selectionToInsertionEnd(tr: Transaction, startLen: number, bias: number) {
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
