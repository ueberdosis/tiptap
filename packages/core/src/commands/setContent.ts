import type { Fragment, Node as ProseMirrorNode, ParseOptions } from '@tiptap/pm/model'

import { createDocument } from '../helpers/createDocument.js'
import type { Content, RawCommands } from '../types.js'

/**
 * Options for the `setContent` command.
 */
export interface SetContentOptions {
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
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setContent: {
      /**
       * Replace the whole document with new content.
       * @param content The new content.
       * @param options Parse options, and whether to emit an update event.
       * @example editor.commands.setContent('<p>Example text</p>')
       */
      setContent: (
        content: Content | Fragment | ProseMirrorNode,
        options?: SetContentOptions,
      ) => ReturnType
    }
  }
}

export const setContent: RawCommands['setContent'] =
  (content, { errorOnInvalidContent, emitUpdate = true, parseOptions = {} } = {}) =>
  ({ editor, tr, dispatch, commands }) => {
    const { doc } = tr

    // This is to keep backward compatibility with the previous behavior
    // TODO remove this in the next major version
    if (parseOptions.preserveWhitespace !== 'full') {
      const document = createDocument(content, editor.schema, parseOptions, {
        errorOnInvalidContent: errorOnInvalidContent ?? editor.options.enableContentCheck,
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
    })
  }
