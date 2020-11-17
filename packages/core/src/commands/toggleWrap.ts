import { wrapIn, lift } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'
import { Command } from '../types'
import nodeIsActive from '../utils/nodeIsActive'
import getNodeType from '../utils/getNodeType'

export default (typeOrName: string | NodeType, attrs = {}): Command => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const isActive = nodeIsActive(state, type, attrs)

  if (isActive) {
    return lift(state, dispatch)
  }

  return wrapIn(type, attrs)(state, dispatch)
}
