import { sinkListItem as originalSinkListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { Command, Commands } from '../types'
import getNodeType from '../helpers/getNodeType'

/**
 * Sink the list item down into an inner list.
 */
export const sinkListItem: Commands['sinkListItem'] = typeOrName => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalSinkListItem(type)(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    sinkListItem: (typeOrName: string | NodeType) => Command,
  }
}
