import { NodeType } from 'prosemirror-model'
import { setBlockType } from 'prosemirror-commands'
import { AnyObject, Command, RawCommands } from '../types'
import getNodeType from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface Commands {
    setNode: {
      /**
       * Replace a given range with a node.
       */
      setNode: (typeOrName: string | NodeType, attributes?: AnyObject) => Command,
    }
  }
}

export const setNode: RawCommands['setNode'] = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return setBlockType(type, attributes)(state, dispatch)
}
