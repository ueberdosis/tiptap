import { NodeType } from '@tiptap/pm/model'

import { getNodeType } from '../helpers/getNodeType.js'
import { isNodeActive } from '../helpers/isNodeActive.js'
import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleNode: {
      /**
       * Toggle a node with another node.
       * @param typeOrName The type or name of the node.
       * @param toggleTypeOrName The type or name of the node to toggle.
       * @param attributes The attributes of the node.
       * @example editor.commands.toggleNode('heading', 'paragraph')
       */
      toggleNode: (
        typeOrName: string | NodeType,
        toggleTypeOrName: string | NodeType,
        attributes?: Record<string, any>,
      ) => ReturnType
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
