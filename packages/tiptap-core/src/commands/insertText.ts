import { Editor } from '../Editor'

declare module '../Editor' {
  interface Editor {
    insertText(value: string): Editor,
  }
}

export default function insertText(next: Function, { state, view }: Editor, value: string): void {
  const transaction = state.tr.insertText(value)

  view.dispatch(transaction)
  next()
}
