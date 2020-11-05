import { liftListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { Command } from '../Editor'
import getNodeType from '../utils/getNodeType'

export default (typeOrName: string | NodeType): Command => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return liftListItem(type)(state, dispatch)
}
