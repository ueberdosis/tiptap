import { wrapIn, lift } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'
import { Command } from '../Editor'
import nodeIsActive from '../utils/nodeIsActive'
import getNodeType from '../utils/getNodeType'

type ToggleWrapCommand = (typeOrName: string | NodeType, attrs?: {}) => Command

declare module '../Editor' {
  interface Commands {
    toggleWrap: ToggleWrapCommand,
  }
}

export const toggleWrap: ToggleWrapCommand = (typeOrName, attrs) => ({
  state, dispatch,
}) => {
  const type = getNodeType(typeOrName, state.schema)
  const isActive = nodeIsActive(state, type, attrs)

  if (isActive) {
    return lift(state, dispatch)
  }

  return wrapIn(type, attrs)(state, dispatch)
}
