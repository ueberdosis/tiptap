import { wrapInList as originalWrapInList } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { RawCommands } from '../types'
import { getNodeType } from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wrapInList: {
      /**
       * Wrap a node in a list.
       */
      wrapInList: (typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType,
    }
  }
}

export const wrapInList: RawCommands['wrapInList'] = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalWrapInList(type, attributes)(state, dispatch)
}
