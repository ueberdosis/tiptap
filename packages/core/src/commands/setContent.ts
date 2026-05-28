import { Fragment, Node as ProseMirrorNode, type ParseOptions } from '@tiptap/pm/model'

import { createDocument } from '../helpers/createDocument.js'
import type { Content, JSONContent, RawCommands } from '../types.js'

function isMigratableJSON(content: Content | Fragment | ProseMirrorNode): content is JSONContent {
  return (
    !!content &&
    typeof content === 'object' &&
    !(content instanceof ProseMirrorNode) &&
    !(content instanceof Fragment) &&
    'type' in content &&
    typeof (content as JSONContent).type === 'string'
  )
}

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

  /**
   * Run document migrations on JSON content before applying it.
   * @default false
   */
  migrate?: boolean

  /**
   * The document version of the content being set.
   * Used as the starting version when `migrate` is `true`.
   * @default The editor's current document version
   */
  documentVersion?: number
}

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
        options?: SetContentOptions,
      ) => ReturnType
    }
  }
}

export const setContent: RawCommands['setContent'] =
  (
    content,
    {
      errorOnInvalidContent,
      emitUpdate = true,
      parseOptions = {},
      migrate = false,
      documentVersion,
    } = {},
  ) =>
  ({ editor, tr, dispatch, commands }) => {
    const { doc } = tr

    let contentToApply: Content | Fragment | ProseMirrorNode = content

    if (migrate && isMigratableJSON(contentToApply)) {
      contentToApply = editor.migrateContent(contentToApply, {
        documentVersion: documentVersion ?? editor.getDocumentVersion(),
      }) as JSONContent
    }

    // This is to keep backward compatibility with the previous behavior
    // TODO remove this in the next major version
    if (parseOptions.preserveWhitespace !== 'full') {
      const document = createDocument(contentToApply, editor.schema, parseOptions, {
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

    return commands.insertContentAt({ from: 0, to: doc.content.size }, contentToApply, {
      parseOptions,
      errorOnInvalidContent: errorOnInvalidContent ?? editor.options.enableContentCheck,
    })
  }
