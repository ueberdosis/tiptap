import { NodeType } from 'prosemirror-model'
import { setBlockType as originalSetBlockType } from 'prosemirror-commands'
import { Command } from '../types'
import getNodeType from '../utils/getNodeType'

/**
 * Replace a given range with a node.
 */
export const setBlockType = (typeOrName: string | NodeType, attrs = {}): Command => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalSetBlockType(type, attrs)(state, dispatch)
}
