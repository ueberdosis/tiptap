import { TextSelection } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'
import { RawCommands } from '../types'
import { getMarkType } from '../helpers/getMarkType'
import { getMarkRange } from '../helpers/getMarkRange'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    extendMarkRange: {
      /**
       * Extends the text selection to the current mark.
       */
      extendMarkRange: (typeOrName: string | MarkType, attributes?: Record<string, any>) => ReturnType,
    }
  }
}

export const extendMarkRange: RawCommands['extendMarkRange'] = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
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
