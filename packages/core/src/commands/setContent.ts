import { ParseOptions } from '@tiptap/pm/model'

import { createDocument } from '../helpers/createDocument.js'
import { Content, RawCommands } from '../types.js'

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
        throwOnError?: boolean
      ) => ReturnType;
    };
  }
}

export const setContent: RawCommands['setContent'] = (content, emitUpdate = false, parseOptions = {}, throwOnError = undefined) => ({ tr, editor, dispatch }) => {
  const { doc } = tr

  try {
    const document = createDocument(
      content,
      editor.schema,
      parseOptions,
      throwOnError ?? editor.options.throwOnError,
    )

    if (dispatch) {
      tr.replaceWith(0, doc.content.size, document).setMeta('preventUpdate', !emitUpdate)
    }
  } catch (e) {
    editor.options.onError({ error: e as Error, editor })
  }

  return true
}
