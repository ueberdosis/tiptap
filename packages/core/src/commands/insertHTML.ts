import { DOMParser } from 'prosemirror-model'
import { Editor } from '../Editor'
import elementFromString from '../utils/elementFromString'

type InsertHTMLCommand = (value: string) => Editor

declare module '../Editor' {
  interface Editor {
    insertHTML: InsertHTMLCommand,
  }
}

export default (next: Function, editor: Editor) => (value: string) => {
  const { view, state } = editor
  const { selection } = state
  const element = elementFromString(value)
  const slice = DOMParser.fromSchema(state.schema).parseSlice(element)
  const transaction = state.tr.insert(selection.anchor, slice.content)

  view.dispatch(transaction)
  next()
}