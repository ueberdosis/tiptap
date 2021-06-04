import { NodeType } from 'prosemirror-model'
import { RawCommands } from '../types'
import isNodeActive from '../helpers/isNodeActive'
import getNodeType from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleNode: {
      /**
       * Toggle a node with another node.
       */
      toggleNode: (typeOrName: string | NodeType, toggleTypeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType,
    }
  }
}

export const toggleNode: RawCommands['toggleNode'] = (typeOrName, toggleTypeOrName, attributes = {}) => ({ state, commands }) => {
  const type = getNodeType(typeOrName, state.schema)
  const toggleType = getNodeType(toggleTypeOrName, state.schema)
  const isActive = isNodeActive(state, type, attributes)

  if (isActive) {
    return commands.setNode(toggleType)
  }

  return commands.setNode(type, attributes)
}
