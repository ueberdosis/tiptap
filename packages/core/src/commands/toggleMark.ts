import { toggleMark as originalToggleMark } from 'prosemirror-commands'
import { MarkType } from 'prosemirror-model'
import { Command } from '../types'
import getMarkType from '../utils/getMarkType'
import markIsActive from '../utils/markIsActive'

/**
 * Toggle a mark on and off.
 */
export const toggleMark = (typeOrName: string | MarkType, attributes?: {}): Command => ({ state, dispatch, commands }) => {
  const type = getMarkType(typeOrName, state.schema)

  const hasMarkWithDifferentAttributes = attributes
    && markIsActive(state, type)
    && !markIsActive(state, type, attributes)

  if (attributes && hasMarkWithDifferentAttributes) {
    return commands.addMark(type, attributes)
  }

  return originalToggleMark(type, attributes)(state, dispatch)
}
