import { NodeType } from 'prosemirror-model'
import { setBlockType } from 'prosemirror-commands'
import { Command } from '../Editor'
import nodeIsActive from '../utils/nodeIsActive'
import getNodeType from '../utils/getNodeType'

type ToggleBlockTypeCommand = (
  typeOrName: string | NodeType,
  toggleType: string | NodeType,
  attrs?: {}
) => Command

declare module '../Editor' {
  interface Commands {
    toggleBlockType: ToggleBlockTypeCommand,
  }
}

export const toggleBlockType: ToggleBlockTypeCommand = (typeOrName, toggleTypeOrName, attrs = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const toggleType = getNodeType(toggleTypeOrName, state.schema)
  const isActive = nodeIsActive(state, type, attrs)

  if (isActive) {
    return setBlockType(toggleType)(state, dispatch)
  }

  return setBlockType(type, attrs)(state, dispatch)
}
