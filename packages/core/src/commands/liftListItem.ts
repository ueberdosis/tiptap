import { liftListItem as originalLiftListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { RawCommands } from '../types'
import getNodeType from '../helpers/getNodeType'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    liftListItem: {
      /**
       * Lift the list item into a wrapping list.
       */
      liftListItem: (typeOrName: string | NodeType) => ReturnType,
    }
  }
}

export const liftListItem: RawCommands['liftListItem'] = typeOrName => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalLiftListItem(type)(state, dispatch)
}
