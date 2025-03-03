import type { MarkType } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'

import { getMarkRange } from '../helpers/getMarkRange.js'
import { getMarkType } from '../helpers/getMarkType.js'
import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    extendMarkRange: {
      /**
       * Extends the text selection to the current mark by type or name.
       * @param typeOrName The type or name of the mark.
       * @param attributes The attributes of the mark.
       * @example editor.commands.extendMarkRange('bold')
       * @example editor.commands.extendMarkRange('mention', { userId: "1" })
       */
      extendMarkRange: (
        /**
         * The type or name of the mark.
         */
        typeOrName: string | MarkType,

        /**
         * The attributes of the mark.
         */
        attributes?: Record<string, any>,
      ) => ReturnType
    }
  }
}

export const extendMarkRange: RawCommands['extendMarkRange'] =
  (typeOrName, attributes = {}) =>
  ({ tr, state, dispatch }) => {
    const type = getMarkType(typeOrName, state.schema)
    const { doc, selection } = tr
    const { $from, from, to } = selection

    if (dispatch) {
      const range = getMarkRange($from, type, attributes)

      if (range && range.from <= from && range.to >= to) {
        const newSelection = TextSelection.create(doc, range.from, range.to)

        tr.setSelection(newSelection)
      }
    }

    return true
  }
