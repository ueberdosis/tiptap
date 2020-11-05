import { toggleMark } from 'prosemirror-commands'
import { MarkType } from 'prosemirror-model'
import { Command } from '../Editor'
import getMarkType from '../utils/getMarkType'
import markIsActive from '../utils/markIsActive'

export default (typeOrName: string | MarkType, attributes?: {}): Command => ({ state, dispatch, commands }) => {
  const type = getMarkType(typeOrName, state.schema)

  const hasMarkWithDifferentAttributes = attributes
    && markIsActive(state, type)
    && !markIsActive(state, type, attributes)

  if (attributes && hasMarkWithDifferentAttributes) {
    return commands.updateMarkAttributes(type, attributes)
  }

  return toggleMark(type, attributes)(state, dispatch)
}
