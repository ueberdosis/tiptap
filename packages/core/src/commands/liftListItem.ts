import { liftListItem as originalLiftListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { Command, Commands } from '../types'
import getNodeType from '../helpers/getNodeType'

/**
 * Lift the list item into a wrapping list.
 */
export const liftListItem: Commands['liftListItem'] = typeOrName => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalLiftListItem(type)(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    liftListItem: (typeOrName: string | NodeType) => Command,
  }
}
