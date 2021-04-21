import { lift as originalLift } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'
import { Command, RawCommands } from '../types'
import isNodeActive from '../helpers/isNodeActive'
import getNodeType from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface Commands {
    lift: {
      /**
       * Removes an existing wrap.
       */
      lift: (typeOrName: string | NodeType, attributes?: Record<string, any>) => Command,
    }
  }
}

export const lift: RawCommands['lift'] = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const isActive = isNodeActive(state, type, attributes)

  if (!isActive) {
    return false
  }

  return originalLift(state, dispatch)
}
