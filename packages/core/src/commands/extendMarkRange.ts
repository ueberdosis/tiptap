import { TextSelection } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'
import { Command } from '../types'
import getMarkType from '../helpers/getMarkType'
import getMarkRange from '../helpers/getMarkRange'

/**
 * Extends the text selection to the current mark.
 */
export const extendMarkRange = (typeOrName: string | MarkType): Command => ({ tr, state, dispatch }) => {
  const type = getMarkType(typeOrName, state.schema)
  const { doc, selection } = tr
  const { $from, empty } = selection

  if (empty && dispatch) {
    const range = getMarkRange($from, type)

    if (range) {
      const newSelection = TextSelection.create(doc, range.from, range.to)

      tr.setSelection(newSelection)
    }
  }

  return true
}
