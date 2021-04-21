import { MarkType } from 'prosemirror-model'
import { Command, RawCommands } from '../types'
import getMarkType from '../helpers/getMarkType'
import isMarkActive from '../helpers/isMarkActive'

declare module '@tiptap/core' {
  interface Commands {
    toggleMark: {
      /**
       * Toggle a mark on and off.
       */
      toggleMark: (typeOrName: string | MarkType, attributes?: Record<string, any>) => Command,
    }
  }
}

export const toggleMark: RawCommands['toggleMark'] = (typeOrName, attributes = {}) => ({ state, commands }) => {
  const type = getMarkType(typeOrName, state.schema)
  const isActive = isMarkActive(state, type, attributes)

  if (isActive) {
    return commands.unsetMark(type)
  }

  return commands.setMark(type, attributes)
}
