import { Editor } from '../Editor'

type InsertText = (value: string) => any

declare module '../Editor' {
  interface Editor {
    insertText: InsertText,
  }
}

export default (next: Function, editor: Editor, value: string): InsertText => () => {
  const { view, state } = editor
  const transaction = state.tr.insertText(value)

  view.dispatch(transaction)
  next()
}
