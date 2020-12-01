import { lift as originalLift } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'
import { Command } from '../types'
import isNodeActive from '../helpers/isNodeActive'
import getNodeType from '../helpers/getNodeType'

/**
 * Removes an existing wrap.
 */
export const lift = (typeOrName: string | NodeType, attributes = {}): Command => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const isActive = isNodeActive(state, type, attributes)

  if (!isActive) {
    return false
  }

  return originalLift(state, dispatch)
}
