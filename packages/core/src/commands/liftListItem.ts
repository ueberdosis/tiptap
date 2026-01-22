import type { NodeType } from '@dibdab/pm/model'
import { liftListItem as originalLiftListItem } from '@dibdab/pm/schema-list'

import { getNodeType } from '../helpers/getNodeType.js'
import type { RawCommands } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    liftListItem: {
      /**
       * Create a command to lift the list item around the selection up into a wrapping list.
       * @param typeOrName The type or name of the node.
       * @example editor.commands.liftListItem('listItem')
       */
      liftListItem: (typeOrName: string | NodeType) => ReturnType
    }
  }
}

export const liftListItem: RawCommands['liftListItem'] =
  typeOrName =>
  ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema)

    return originalLiftListItem(type)(state, dispatch)
  }
