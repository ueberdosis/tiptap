import { NodeType } from '@tiptap/pm/model'
import { liftListItem as originalLiftListItem } from '@tiptap/pm/schema-list'

import { getNodeType } from '../helpers/getNodeType.js'
import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    liftListItem: {
      /**
       * Lift the list item into a wrapping list.
       */
      liftListItem: (typeOrName: string | NodeType) => ReturnType
    }
  }
}

export const liftListItem: RawCommands['liftListItem'] = typeOrName => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalLiftListItem(type)(state, dispatch)
}
