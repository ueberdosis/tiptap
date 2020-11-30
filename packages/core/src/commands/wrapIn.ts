import { wrapIn as originalWrapIn } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'
import { Command } from '../types'
import nodeIsActive from '../helpers/nodeIsActive'
import getNodeType from '../helpers/getNodeType'

/**
 * Wraps nodes in another node.
 */
export const wrapIn = (typeOrName: string | NodeType, attributes = {}): Command => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const isActive = nodeIsActive(state, type, attributes)

  if (isActive) {
    return false
  }

  return originalWrapIn(type, attributes)(state, dispatch)
}
