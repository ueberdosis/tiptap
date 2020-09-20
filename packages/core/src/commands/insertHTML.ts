import { DOMParser } from 'prosemirror-model'
import { Selection } from 'prosemirror-state'
import { Command } from '../Editor'
import elementFromString from '../utils/elementFromString'
import {ReplaceStep, ReplaceAroundStep} from "prosemirror-transform"

type InsertHTMLCommand = (value: string) => Command

declare module '../Editor' {
  interface Editor {
    insertHTML: InsertHTMLCommand,
  }
}

// TODO: move to utils
// https://github.com/ProseMirror/prosemirror-state/blob/master/src/selection.js#L466
function selectionToInsertionEnd(tr, startLen, bias) {
  let last = tr.steps.length - 1
  if (last < startLen) return
  let step = tr.steps[last]
  if (!(step instanceof ReplaceStep || step instanceof ReplaceAroundStep)) return
  let map = tr.mapping.maps[last], end
  map.forEach((_from, _to, _newFrom, newTo) => { if (end == null) end = newTo })
  tr.setSelection(Selection.near(tr.doc.resolve(end), bias))
}

export const insertHTML: InsertHTMLCommand = value => ({ tr, editor }) => {
  console.log({tr })
  const { state } = editor
  const { selection } = tr
  const element = elementFromString(value)
  const slice = DOMParser.fromSchema(state.schema).parseSlice(element)

  tr.insert(selection.anchor, slice.content)
  // TODO: set correct bias by content
  selectionToInsertionEnd(tr, tr.steps.length - 1, -1)

  return true
}