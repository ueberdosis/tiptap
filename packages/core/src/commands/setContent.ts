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
        content: Content | Fragment | ProseMirrorNode,

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
          errorOnInvalidContent?: boolean;
        }
      ) => ReturnType;
    };
  }
}

export const setContent: RawCommands['setContent'] = (content, emitUpdate = false, parseOptions = {}, options = {}) => ({
  editor, tr, dispatch, commands,
}) => {
  const { doc } = tr

  // This is to keep backward compatibility with the previous behavior
  // TODO remove this in the next major version
  if (parseOptions.preserveWhitespace !== 'full') {
    const document = createDocument(content, editor.schema, parseOptions, {
      errorOnInvalidContent: options.errorOnInvalidContent ?? editor.options.enableContentCheck,
    })

    if (dispatch) {
      tr.replaceWith(0, doc.content.size, document).setMeta('preventUpdate', !emitUpdate)
    }
    return true
  }

  if (dispatch) {
    tr.setMeta('preventUpdate', !emitUpdate)
  }

  return commands.insertContentAt({ from: 0, to: doc.content.size }, content, {
    parseOptions,
    errorOnInvalidContent: options.errorOnInvalidContent ?? editor.options.enableContentCheck,
  })
}
