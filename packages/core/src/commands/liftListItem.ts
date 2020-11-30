import { liftListItem as originalLiftListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { Command } from '../types'
import getNodeType from '../helpers/getNodeType'

/**
 * Lift the list item into a wrapping list.
 */
export const liftListItem = (typeOrName: string | NodeType): Command => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalLiftListItem(type)(state, dispatch)
}
