import { Editor } from '../Editor'

declare module "../Editor" {
  interface Editor {
    insertText(text: string): Editor,
  }
}

export default function insertText(next: Function, { state, view }: Editor, text: string): void {
  view.dispatch(state.tr.insertText(text))
  next()
}
