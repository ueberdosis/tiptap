import { Editor } from '../Editor'

declare module '../Editor' {
  interface Editor {
    insertText(value: string): Editor,
  }
}

export default function insertText(next: Function, editor: Editor, value: string): void {
  const { view, state } = editor
  const transaction = state.tr.insertText(value)

  view.dispatch(transaction)
  next()
}
