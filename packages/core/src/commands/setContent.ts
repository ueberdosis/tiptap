import { TextSelection } from 'prosemirror-state'
import { Command } from '../Editor'

export default (content: string, emitUpdate: Boolean = false, parseOptions = {}): Command => ({ tr, editor, dispatch }) => {
  const { createDocument } = editor
  const { doc } = tr
  const document = createDocument(content, parseOptions)
  const selection = TextSelection.create(doc, 0, doc.content.size)

  if (dispatch) {
    tr.setSelection(selection)
      .replaceSelectionWith(document, false)
      .setMeta('preventUpdate', !emitUpdate)
  }

  return true
}
