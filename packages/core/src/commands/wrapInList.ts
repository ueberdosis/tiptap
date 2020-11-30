import { wrapInList as originalWrapInList } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { Command } from '../types'
import getNodeType from '../helpers/getNodeType'

/**
 * Wrap a node in a list.
 */
export const wrapInList = (typeOrName: string | NodeType, attrs?: {}): Command => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalWrapInList(type, attrs)(state, dispatch)
}
