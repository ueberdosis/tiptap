import { DOMParser } from 'prosemirror-model'
import { Selection, Transaction } from 'prosemirror-state'
import { ReplaceStep, ReplaceAroundStep } from 'prosemirror-transform'
import elementFromString from '../utilities/elementFromString'
import { Command, Commands } from '../types'

// TODO: move to utils
// https://github.com/ProseMirror/prosemirror-state/blob/master/src/selection.js#L466
function selectionToInsertionEnd(tr: Transaction, startLen: number, bias: number) {
  const last = tr.steps.length - 1
  if (last < startLen) return
  const step = tr.steps[last]
  if (!(step instanceof ReplaceStep || step instanceof ReplaceAroundStep)) return
  const map = tr.mapping.maps[last]
  let end = 0
  map.forEach((_from, _to, _newFrom, newTo) => { if (end === 0) end = newTo })
  tr.setSelection(Selection.near(tr.doc.resolve(end as unknown as number), bias))
}

declare module '@tiptap/core' {
  interface Commands {
    /**
     * Insert a string of HTML at the current position.
     */
    insertHTML: (value: string) => Command,
  }
}

export const insertHTML: Commands['insertHTML'] = value => ({ tr, state, dispatch }) => {
  const { selection } = tr
  const element = elementFromString(value)
  const slice = DOMParser.fromSchema(state.schema).parseSlice(element)

  if (dispatch) {
    tr.insert(selection.anchor, slice.content)
    selectionToInsertionEnd(tr, tr.steps.length - 1, -1)
  }

  return true
}
