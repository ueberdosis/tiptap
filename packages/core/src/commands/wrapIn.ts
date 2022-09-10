import { wrapIn as originalWrapIn } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'

import { getNodeType } from '../helpers/getNodeType'
import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wrapIn: {
      /**
       * Wraps nodes in another node.
       */
      wrapIn: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType,
    }
  }
}

export const wrapIn: RawCommands['wrapIn'] = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalWrapIn(type, attributes)(state, dispatch)
}
