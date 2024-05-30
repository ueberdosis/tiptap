import { Fragment, Node as ProseMirrorNode, ParseOptions } from '@tiptap/pm/model'

import { createDocument } from '../helpers/createDocument.js'
import { Content, RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setContent: {
      /**
       * Replace the whole document with new content.
       * @param content The new content.
       * @param emitUpdate Whether to emit an update event.
       * @param parseOptions Options for parsing the content.
       * @example editor.commands.setContent('<p>Example text</p>')
       */
      setContent: (
        /**
         * The new content.
         */
        content: Content,

        /**
         * Whether to emit an update event.
         * @default false
         */
        emitUpdate?: boolean,

        /**
         * Options for parsing the content.
         * @default {}
         */
        parseOptions?: ParseOptions,
        /**
         * Options for `setContent`.
         */
        options?: {
          /**
           * Whether to throw an error if the content is invalid.
           */
           errorOnInvalidContent?: boolean
        },
      ) => ReturnType
    }
  }
}

export const setContent: RawCommands['setContent'] = (content, emitUpdate = false, parseOptions = {}, options = {}) => ({ tr, editor, dispatch }) => {
  const { doc } = tr

  let document: Fragment | ProseMirrorNode

  try {
    document = createDocument(content, editor.schema, parseOptions, {
      errorOnInvalidContent: options.errorOnInvalidContent ?? editor.options.enableContentCheck,
    })
  } catch (e) {
    if (!(e instanceof Error) || !['[tiptap error]: Invalid JSON content', '[tiptap error]: Invalid HTML content'].includes(e.message)) {
      // Not the content error we were expecting
      throw e
    }
    // Only ever throws if enableContentCheck or errorOnInvalidContent is true
    editor.emit('contentError', { editor, error: e as Error })
    return false
  }

  if (dispatch) {
    tr.replaceWith(0, doc.content.size, document).setMeta('preventUpdate', !emitUpdate)
  }

  return true
}
