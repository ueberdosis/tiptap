import { liftListItem as originalLiftListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import { Command } from '../Editor'
import getNodeType from '../utils/getNodeType'

type LiftListItem = (typeOrName: string | NodeType) => Command

declare module '../Editor' {
  interface Commands {
    liftListItem: LiftListItem,
  }
}

export const liftListItem: LiftListItem = typeOrName => ({ state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)

  return originalLiftListItem(type)(state, dispatch)
}
