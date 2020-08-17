import { Editor } from '../Editor'

type InsertTextCommand = (value: string) => Editor

declare module '../Editor' {
  interface Editor {
    insertText: InsertTextCommand,
  }
}

export default (next: Function, editor: Editor) => (value: string) => {
  const { view, state } = editor
  const transaction = state.tr.insertText(value)

  view.dispatch(transaction)
  next()
}
