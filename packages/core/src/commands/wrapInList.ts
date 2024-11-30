import { NodeType } from '@tiptap/pm/model'
import { wrapInList as originalWrapInList } from '@tiptap/pm/schema-list'

import { getNodeType } from '../helpers/getNodeType.js'
import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wrapInList: {
      /**
       * Wrap a node in a list.
       * @param typeOrName The type or name of the node.
       * @param attributes The attributes of the node.
       * @example editor.commands.wrapInList('bulletList')
       */
      wrapInList: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType
    }
  }
}

export const wrapInList: RawCommands['wrapInList'] = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalWrapInList(type, attributes)(state, dispatch)
}
