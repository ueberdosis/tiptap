import { MarkType } from 'prosemirror-model'
import { AnyObject, Command, Commands } from '../types'
import getMarkType from '../helpers/getMarkType'
import isMarkActive from '../helpers/isMarkActive'

/**
 * Toggle a mark on and off.
 */
export const toggleMark: Commands['toggleMark'] = (typeOrName, attributes = {}) => ({ state, commands }) => {
  const type = getMarkType(typeOrName, state.schema)
  const isActive = isMarkActive(state, type, attributes)

  if (isActive) {
    return commands.unsetMark(type)
  }

  return commands.setMark(type, attributes)
}

declare module '@tiptap/core' {
  interface Commands {
    toggleMark: (typeOrName: string | MarkType, attributes?: AnyObject) => Command,
  }
}
