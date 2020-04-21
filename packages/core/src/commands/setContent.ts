import { Editor } from '../Editor'
import { TextSelection } from 'prosemirror-state'

type SetContent = (
  content: string,
  emitUpdate?: Boolean,
  parseOptions?: any,
) => any

declare module '../Editor' {
  interface Editor {
    setContent: SetContent,
  }
}

export default (next: Function, editor: Editor): SetContent => (content, emitUpdate, parseOptions) => {
  if (content === null) {
    next()
    return
  }

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
