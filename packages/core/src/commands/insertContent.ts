import type { Fragment, Node as ProseMirrorNode, ParseOptions } from '@tiptap/pm/model'

import type { Content, ContentType, RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertContent: {
      /**
       * Insert a node or string of HTML at the current position.
       * @example editor.commands.insertContent('<h1>Example</h1>')
       * @example editor.commands.insertContent('<h1>Example</h1>', { updateSelection: false })
       */
      insertContent: (
        /**
         * The ProseMirror content to insert.
         */
        value: Content | ProseMirrorNode | Fragment,

        /**
         * Optional options
         */
        options?: {
          /**
           * Options for parsing the content.
           */
          parseOptions?: ParseOptions

          /**
           * Whether to update the selection after inserting the content.
           */
          updateSelection?: boolean
          applyInputRules?: boolean
          applyPasteRules?: boolean

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

export const insertContent: RawCommands['insertContent'] =
  (value, options) =>
  ({ tr, commands }) => {
    return commands.insertContentAt({ from: tr.selection.from, to: tr.selection.to }, value, options)
  }
