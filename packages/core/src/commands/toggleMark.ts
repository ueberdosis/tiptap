import { MarkType } from 'prosemirror-model'
import { Command } from '../types'
import getMarkType from '../helpers/getMarkType'
import isMarkActive from '../helpers/isMarkActive'

/**
 * Toggle a mark on and off.
 */
export const toggleMark = (typeOrName: string | MarkType, attributes?: {}): Command => ({ state, commands }) => {
  const type = getMarkType(typeOrName, state.schema)
  const isActive = isMarkActive(state, type, attributes)

  if (isActive) {
    return commands.unsetMark(type)
  }

  return commands.setMark(type, attributes)
}
