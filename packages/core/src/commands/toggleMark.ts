import { toggleMark as originalToggleMark } from 'prosemirror-commands'
import { MarkType } from 'prosemirror-model'
import { Command } from '../Editor'
import getMarkType from '../utils/getMarkType'

export default (typeOrName: string | MarkType): Command => ({ state, dispatch }) => {
  const type = getMarkType(typeOrName, state.schema)

  return originalToggleMark(type)(state, dispatch)
}
