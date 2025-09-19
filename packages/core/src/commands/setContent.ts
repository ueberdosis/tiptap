import type { Fragment, Node as ProseMirrorNode, ParseOptions } from '@tiptap/pm/model'

import { createDocument } from '../helpers/createDocument.js'
import type { Content, ContentType, RawCommands } from '../types.js'

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
         * Options for `setContent`.
         */
        options?: {
          /**
           * Options for parsing the content.
           * @default {}
           */
          parseOptions?: ParseOptions

          /**
           * Whether to throw an error if the content is invalid.
           */
          errorOnInvalidContent?: boolean

          /**
           * Whether to emit an update event.
           * @default true
           */
          emitUpdate?: boolean

          /**
           * The content type that determines how the content should be parsed.
           * - 'json': Parse as Tiptap JSON
           * - 'html': Parse as HTML (default for strings)
           * - 'markdown': Parse as Markdown using the markdown parser
           *
           * If not specified, follows the same detection rules as editor content:
           * - Objects/arrays are treated as JSON
           * - Strings are treated as HTML by default
           */
          contentType?: ContentType
        },
      ) => ReturnType
    }
  }
}

export const setContent: RawCommands['setContent'] =
  (content, { errorOnInvalidContent, emitUpdate = true, parseOptions = {}, contentType } = {}) =>
  ({ editor, tr, dispatch, commands }) => {
    const { doc } = tr

    // This is to keep backward compatibility with the previous behavior
    // TODO remove this in the next major version
    if (parseOptions.preserveWhitespace !== 'full') {
      const document = createDocument(content, editor.schema, parseOptions, {
        errorOnInvalidContent: errorOnInvalidContent ?? editor.options.enableContentCheck,
        contentType,
        markdownManager: editor.markdown,
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
      errorOnInvalidContent: errorOnInvalidContent ?? editor.options.enableContentCheck,
      contentType,
    })
  }
