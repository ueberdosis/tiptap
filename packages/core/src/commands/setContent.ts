import { ParseOptions } from 'prosemirror-model'
import { TextSelection } from 'prosemirror-state'

import { createDocument } from '../helpers/createDocument'
import { Content, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setContent: {
      /**
       * Replace the whole document with new content.
       */
      setContent: (
        content: Content,
        emitUpdate?: boolean,
        parseOptions?: ParseOptions,
      ) => ReturnType,
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
