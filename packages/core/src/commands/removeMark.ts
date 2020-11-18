import { MarkType } from 'prosemirror-model'
import { Command } from '../types'
import getMarkType from '../utils/getMarkType'
import getMarkRange from '../utils/getMarkRange'

/**
 * Remove all marks in the current selection.
 */
export const removeMark = (typeOrName: string | MarkType): Command => ({ tr, state, dispatch }) => {
  const { selection } = tr
  const type = getMarkType(typeOrName, state.schema)
  let { from, to } = selection
  const { $from, empty } = selection

  if (empty) {
    const range = getMarkRange($from, type)

    if (range) {
      from = range.from
      to = range.to
    }
  }

  if (dispatch) {
    tr.removeMark(from, to, type)
  }

  return true
}
