import { wrapIn } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'
import { Command } from '../types'
import nodeIsActive from '../utils/nodeIsActive'
import getNodeType from '../utils/getNodeType'

export default (typeOrName: string | NodeType, attributes = {}): Command => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const isActive = nodeIsActive(state, type, attributes)

  if (isActive) {
    return false
  }

  return wrapIn(type, attributes)(state, dispatch)
}
