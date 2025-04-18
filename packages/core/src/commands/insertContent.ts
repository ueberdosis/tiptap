import { Fragment, Node as ProseMirrorNode, ParseOptions } from '@tiptap/pm/model'

import { Content, RawCommands } from '../types.js'

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
          parseOptions?: ParseOptions;

          /**
           * Whether to update the selection after inserting the content.
           */
          updateSelection?: boolean;
          applyInputRules?: boolean;
          applyPasteRules?: boolean;

          /**
           * Whether to use parseSlice function to parse the content.
           * @default true
           */
          slice?: boolean
        }
      ) => ReturnType;
    };
  }
}

export const insertContent: RawCommands['insertContent'] = (value, options) => ({ tr, commands }) => {
  return commands.insertContentAt(
    { from: tr.selection.from, to: tr.selection.to },
    value,
    options,
  )
}
