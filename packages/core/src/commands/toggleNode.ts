import { NodeType } from 'prosemirror-model'
import { Command } from '../types'
import nodeIsActive from '../utils/nodeIsActive'
import getNodeType from '../utils/getNodeType'

/**
 * Toggle a node with another node.
 */
export const toggleNode = (typeOrName: string | NodeType, toggleTypeOrName: string | NodeType, attrs = {}): Command => ({ state, commands }) => {
  const type = getNodeType(typeOrName, state.schema)
  const toggleType = getNodeType(toggleTypeOrName, state.schema)
  const isActive = nodeIsActive(state, type, attrs)

  if (isActive) {
    return commands.setNode(toggleType)
  }

  return commands.setNode(type, attrs)
}
