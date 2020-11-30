import { MarkType } from 'prosemirror-model'
import { Command } from '../types'
import getMarkType from '../helpers/getMarkType'
import markIsActive from '../helpers/markIsActive'

/**
 * Toggle a mark on and off.
 */
export const toggleMark = (typeOrName: string | MarkType, attributes?: {}): Command => ({ state, commands }) => {
  const type = getMarkType(typeOrName, state.schema)
  const isActive = markIsActive(state, type, attributes)

  if (isActive) {
    return commands.unsetMark(type)
  }

  return commands.setMark(type, attributes)
}
