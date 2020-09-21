import { Command } from '../Editor'
import { sinkListItem as originalSinkListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import getNodeType from '../utils/getNodeType'

type SinkListItem = (typeOrName: string | NodeType) => Command

declare module '../Editor' {
  interface Editor {
    sinkListItem: SinkListItem,
  }
}

export const sinkListItem: SinkListItem = (typeOrName) => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalSinkListItem(type)(state, dispatch)
}
