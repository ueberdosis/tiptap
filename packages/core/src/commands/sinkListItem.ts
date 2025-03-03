import type { NodeType } from '@tiptap/pm/model'
import { sinkListItem as originalSinkListItem } from '@tiptap/pm/schema-list'

import { getNodeType } from '../helpers/getNodeType.js'
import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sinkListItem: {
      /**
       * Sink the list item down into an inner list.
       * @param typeOrName The type or name of the node.
       * @example editor.commands.sinkListItem('listItem')
       */
      sinkListItem: (typeOrName: string | NodeType) => ReturnType
    }
  }
}

export const sinkListItem: RawCommands['sinkListItem'] =
  typeOrName =>
  ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema)

    return originalSinkListItem(type)(state, dispatch)
  }
