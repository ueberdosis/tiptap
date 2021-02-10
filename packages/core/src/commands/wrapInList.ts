import { wrapInList as originalWrapInList } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { AnyObject, Command, Commands } from '../types'
import getNodeType from '../helpers/getNodeType'

/**
 * Wrap a node in a list.
 */
export const wrapInList: Commands['wrapInList'] = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalWrapInList(type, attributes)(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    wrapInList: (typeOrName: string | NodeType, attributes?: AnyObject) => Command,
  }
}
