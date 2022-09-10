import { NodeType } from 'prosemirror-model'
import { sinkListItem as originalSinkListItem } from 'prosemirror-schema-list'

import { getNodeType } from '../helpers/getNodeType'
import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sinkListItem: {
      /**
       * Sink the list item down into an inner list.
       */
      sinkListItem: (typeOrName: string | NodeType) => ReturnType,
    }
  }
}

export const sinkListItem: RawCommands['sinkListItem'] = typeOrName => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalSinkListItem(type)(state, dispatch)
}
