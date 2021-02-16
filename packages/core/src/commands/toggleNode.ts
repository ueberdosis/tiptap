import { NodeType } from 'prosemirror-model'
import { AnyObject, Command, RawCommands } from '../types'
import isNodeActive from '../helpers/isNodeActive'
import getNodeType from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface Commands {
    toggleNode: {
      /**
       * Toggle a node with another node.
       */
      toggleNode: (typeOrName: string | NodeType, toggleTypeOrName: string | NodeType, attributes?: AnyObject) => Command,
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
