import { MarkType } from 'prosemirror-model'
import { Command } from '../Editor'
import getMarkType from '../utils/getMarkType'
import getMarkRange from '../utils/getMarkRange'

export default (typeOrName: string | MarkType, attrs: {}): Command => ({ tr, state, dispatch }) => {
  const { selection, doc } = tr
  let { from, to } = selection
  const { $from, empty } = selection
  const type = getMarkType(typeOrName, state.schema)

  if (empty) {
    const range = getMarkRange($from, type)

    if (range) {
      from = range.from
      to = range.to
    }
  }

  const hasMark = doc.rangeHasMark(from, to, type)

  if (hasMark && dispatch) {
    tr.removeMark(from, to, type)
  }

  if (dispatch) {
    tr.addMark(from, to, type.create(attrs))
  }

  return true
}
