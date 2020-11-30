import { splitListItem as originalSplitListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { Command } from '../types'
import getNodeType from '../helpers/getNodeType'

/**
 * Splits one list item into two list items.
 */
export const splitListItem = (typeOrName: string | NodeType): Command => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalSplitListItem(type)(state, dispatch)
}
