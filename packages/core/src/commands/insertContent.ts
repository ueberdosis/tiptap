import type { Fragment, Node as ProseMirrorNode, ParseOptions } from '@dibdab/pm/model'

import type { CommandSpec,Content } from '../types.js'

export interface InsertContentOptions {
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
}

declare module '@dibdab/core' {
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
        options?: InsertContentOptions,
      ) => ReturnType
    }
  }
}

export const insertContent: CommandSpec =
  (value, options) =>
  ({ tr, commands }) => {
    return commands.insertContentAt({ from: tr.selection.from, to: tr.selection.to }, value, options)
  }
