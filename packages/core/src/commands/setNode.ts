import { NodeType } from 'prosemirror-model'
import { setBlockType } from 'prosemirror-commands'
import { Command } from '../types'
import getNodeType from '../helpers/getNodeType'

/**
 * Replace a given range with a node.
 */
export const setNode = (typeOrName: string | NodeType, attrs = {}): Command => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return setBlockType(type, attrs)(state, dispatch)
}
