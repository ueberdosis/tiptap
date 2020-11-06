import { MarkType } from 'prosemirror-model'
import { Command } from '../Editor'
import getMarkType from '../utils/getMarkType'
import getMarkAttrs from '../utils/getMarkAttrs'

export default (typeOrName: string | MarkType, attributes: {}): Command => ({ tr, state, dispatch }) => {
  const { selection } = tr
  const { from, to, empty } = selection
  const type = getMarkType(typeOrName, state.schema)
  const oldAttributes = getMarkAttrs(state, type)
  const newAttributes = {
    ...oldAttributes,
    ...attributes,
  }

  if (dispatch) {
    if (empty) {
      tr.addStoredMark(type.create(newAttributes))
    } else {
      tr.addMark(from, to, type.create(newAttributes))
    }
  }

  return true
}
