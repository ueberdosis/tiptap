import { Command } from '../Editor'
import { selectParentNode as originalSelectParentNode } from 'prosemirror-commands'

type SelectParentNodeCommand = () => Command

declare module '../Editor' {
  interface Editor {
    selectParentNode: SelectParentNodeCommand,
  }
}

export const selectParentNode: SelectParentNodeCommand = () => ({ state, dispatch }) => {
  return originalSelectParentNode(state, dispatch)
}
