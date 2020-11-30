import { wrapIn, lift } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'
import { Command } from '../types'
import nodeIsActive from '../helpers/nodeIsActive'
import getNodeType from '../helpers/getNodeType'

/**
 * Wraps nodes in another node, or removes an existing wrap.
 */
export const toggleWrap = (typeOrName: string | NodeType, attributes = {}): Command => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const isActive = nodeIsActive(state, type, attributes)

  if (isActive) {
    return lift(state, dispatch)
  }

  return wrapIn(type, attributes)(state, dispatch)
}
