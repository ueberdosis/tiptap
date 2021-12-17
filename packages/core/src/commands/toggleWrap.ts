import { NodeType } from 'prosemirror-model'
import { RawCommands } from '../types'
import { isNodeActive } from '../helpers/isNodeActive'
import { getNodeType } from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleWrap: {
      /**
       * Wraps nodes in another node, or removes an existing wrap.
       */
      toggleWrap: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType,
    }
  }
}

export const toggleWrap: RawCommands['toggleWrap'] = (typeOrName, attributes = {}) => ({ state, commands }) => {
  const type = getNodeType(typeOrName, state.schema)
  const isActive = isNodeActive(state, type, attributes)

  if (isActive) {
    return commands.lift(type)
  }

  return commands.wrapIn(type, attributes)
}
