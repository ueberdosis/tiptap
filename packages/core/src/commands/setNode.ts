import { NodeType } from 'prosemirror-model'
import { setBlockType } from 'prosemirror-commands'
import { AnyObject, Command, Commands } from '../types'
import getNodeType from '../helpers/getNodeType'

/**
 * Replace a given range with a node.
 */
export const setNode: Commands['setNode'] = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return setBlockType(type, attributes)(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    setNode: (typeOrName: string | NodeType, attributes?: AnyObject) => Command,
  }
}
