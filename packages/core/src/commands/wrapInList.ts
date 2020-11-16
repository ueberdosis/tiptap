import { wrapInList } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { Command } from '../types'
import getNodeType from '../utils/getNodeType'

export default (typeOrName: string | NodeType, attrs?: {}): Command => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return wrapInList(type, attrs)(state, dispatch)
}
