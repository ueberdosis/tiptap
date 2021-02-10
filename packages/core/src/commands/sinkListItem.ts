import { sinkListItem as originalSinkListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { Command, Commands } from '../types'
import getNodeType from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface Commands {
    /**
     * Sink the list item down into an inner list.
     */
    sinkListItem: (typeOrName: string | NodeType) => Command,
  }
}

export const sinkListItem: Commands['sinkListItem'] = typeOrName => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalSinkListItem(type)(state, dispatch)
}
