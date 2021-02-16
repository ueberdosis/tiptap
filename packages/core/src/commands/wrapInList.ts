import { wrapInList as originalWrapInList } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { AnyObject, Command, RawCommands } from '../types'
import getNodeType from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface Commands {
    wrapInList: {
      /**
       * Wrap a node in a list.
       */
      wrapInList: (typeOrName: string | NodeType, attributes?: AnyObject) => Command,
    }
  }
}

export const wrapInList: RawCommands['wrapInList'] = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalWrapInList(type, attributes)(state, dispatch)
}
