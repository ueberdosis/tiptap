import { TextSelection } from 'prosemirror-state'
import { AnyObject, Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    setContent: {
      /**
       * Replace the whole document with new content.
       */
      setContent: (content: string, emitUpdate?: Boolean, parseOptions?: AnyObject) => Command,
    }
  }
}

export const setContent: RawCommands['setContent'] = (content, emitUpdate = false, parseOptions = {}) => ({ tr, editor, dispatch }) => {
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
