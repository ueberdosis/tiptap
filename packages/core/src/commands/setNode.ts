import { NodeType } from 'prosemirror-model'
import { setBlockType } from 'prosemirror-commands'
import { RawCommands } from '../types'
import { getNodeType } from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setNode: {
      /**
       * Replace a given range with a node.
       */
      setNode: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType,
    }
  }
}

export const setNode: RawCommands['setNode'] = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return setBlockType(type, attributes)(state, dispatch)
}
