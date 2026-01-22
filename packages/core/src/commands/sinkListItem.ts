import type { NodeType } from '@dibdab/pm/model'
import { sinkListItem as originalSinkListItem } from '@dibdab/pm/schema-list'

import { getNodeType } from '../helpers/getNodeType.js'
import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
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

export const sinkListItem: CommandSpec =
  typeOrName =>
  ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema)

    return originalSinkListItem(type)(state, dispatch)
  }
