import { MarkType } from 'prosemirror-model'
import { Command } from '../types'
import getMarkType from '../utils/getMarkType'

export default (typeOrName: string | MarkType, attributes?: {}): Command => ({ tr, state, dispatch }) => {
  const { selection } = tr
  const type = getMarkType(typeOrName, state.schema)
  const { from, to } = selection

  if (dispatch) {
    tr.addMark(from, to, type.create(attributes))
  }

  return true
}
