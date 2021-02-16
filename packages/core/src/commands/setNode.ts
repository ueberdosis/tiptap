import { NodeType } from 'prosemirror-model'
import { setBlockType } from 'prosemirror-commands'
import { AnyObject, Command, Commands } from '../types'
import getNodeType from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface AllCommands {
    setNode: {
      /**
       * Replace a given range with a node.
       */
      setNode: (typeOrName: string | NodeType, attributes?: AnyObject) => Command,
    }
  }
}

export const setNode: Commands['setNode'] = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return setBlockType(type, attributes)(state, dispatch)
}
