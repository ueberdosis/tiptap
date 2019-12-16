import { DOMParser } from 'prosemirror-model'
import { Editor } from '../Editor'
import elementFromString from '../utils/elementFromString'

declare module '../Editor' {
  interface Editor {
    insertHTML(value: string): Editor,
  }
}

export default function insertHTML(next: Function, { state, view }: Editor, value: string): void {
  const { selection } = state
  const element = elementFromString(value)
  const slice = DOMParser.fromSchema(state.schema).parseSlice(element)
  const transaction = state.tr.insert(selection.anchor, slice.content)

  view.dispatch(transaction)
  next()
}