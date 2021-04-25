import { TextSelection } from 'prosemirror-state'
import createDocument from '../helpers/createDocument'
import { Command, RawCommands, Content } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    setContent: {
      /**
       * Replace the whole document with new content.
       */
      setContent: (
        content: Content,
        emitUpdate?: boolean,
        parseOptions?: Record<string, any>,
      ) => Command,
    }
  }
}

export const setContent: RawCommands['setContent'] = (content, emitUpdate = false, parseOptions = {}) => ({ tr, editor, dispatch }) => {
  const { doc } = tr
  const document = createDocument(content, editor.schema, parseOptions)
  const selection = TextSelection.create(doc, 0, doc.content.size)

  if (dispatch) {
    tr.setSelection(selection)
      .replaceSelectionWith(document, false)
      .setMeta('preventUpdate', !emitUpdate)
  }

  return true
}
