import { wrapIn, lift } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'
import { Command, RawCommands } from '../types'
import isNodeActive from '../helpers/isNodeActive'
import getNodeType from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface Commands {
    toggleWrap: {
      /**
       * Wraps nodes in another node, or removes an existing wrap.
       */
      toggleWrap: (typeOrName: string | NodeType, attributes?: Record<string, any>) => Command,
    }
  }
}

export const toggleWrap: RawCommands['toggleWrap'] = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const isActive = isNodeActive(state, type, attributes)

  if (isActive) {
    return lift(state, dispatch)
  }

  return wrapIn(type, attributes)(state, dispatch)
}
