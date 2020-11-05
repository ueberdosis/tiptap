import { toggleMark } from 'prosemirror-commands'
import { MarkType } from 'prosemirror-model'
import { Command } from '../Editor'
import getMarkType from '../utils/getMarkType'
import markIsActive from '../utils/markIsActive'

export default (typeOrName: string | MarkType, attrs?: {}): Command => ({ state, dispatch, commands }) => {
  const type = getMarkType(typeOrName, state.schema)

  const hasMarkWithDifferentAttributes = attrs
    && markIsActive(state, type)
    && !markIsActive(state, type, attrs)

  if (attrs && hasMarkWithDifferentAttributes) {
    return commands.updateMarkAttributes(type, attrs)
  }

  return toggleMark(type)(state, dispatch)
}
