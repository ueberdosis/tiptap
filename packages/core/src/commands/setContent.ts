import { Editor } from '../Editor'
import { TextSelection } from 'prosemirror-state'

type SetContentCommand = (
  content: string,
  emitUpdate?: Boolean,
  parseOptions?: any,
) => Editor

declare module '../Editor' {
  interface Editor {
    setContent: SetContentCommand,
  }
}

export default (next: Function, editor: Editor) => (content: string, emitUpdate: Boolean = false, parseOptions = {}) => {
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
