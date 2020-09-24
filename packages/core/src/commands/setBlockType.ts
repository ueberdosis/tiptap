import { NodeType } from 'prosemirror-model'
import { setBlockType as originalSetBlockType } from 'prosemirror-commands'
import { Command } from '../Editor'
import getNodeType from '../utils/getNodeType'

type SetBlockTypeCommand = (
  typeOrName: string | NodeType,
  attrs?: {},
) => Command

declare module '../Editor' {
  interface Commands {
    setBlockType: SetBlockTypeCommand,
  }
}

export const setBlockType: SetBlockTypeCommand = (typeOrName, attrs = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalSetBlockType(type, attrs)(state, dispatch)
}
