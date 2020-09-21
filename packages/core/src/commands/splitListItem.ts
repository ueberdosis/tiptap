import { Command } from '../Editor'
import { splitListItem as originalSplitListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import getNodeType from '../utils/getNodeType'

type SplitListItem = (typeOrName: string | NodeType) => Command

declare module '../Editor' {
  interface Editor {
    splitListItem: SplitListItem,
  }
}

export const splitListItem: SplitListItem = (typeOrName) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalSplitListItem(type)(state, dispatch)
}
