import { Editor } from '../Editor'
import { TextSelection } from 'prosemirror-state'

declare module '../Editor' {
  interface Editor {
    setContent(content: string, emitUpdate: Boolean, parseOptions: any): Editor,
  }
}

export default function setContent(next: Function, editor: Editor, content: string, emitUpdate: Boolean = true, parseOptions: any = {}): void {
  const { view, state, createDocument } = editor
  const { doc, tr } = state
  const document = createDocument(content, parseOptions)
  const selection = TextSelection.create(doc, 0, doc.content.size)
  const transaction = tr
    .setSelection(selection)
    .replaceSelectionWith(document, false)
    .setMeta('preventUpdate', !emitUpdate)

  view.dispatch(transaction)
  next()
}
