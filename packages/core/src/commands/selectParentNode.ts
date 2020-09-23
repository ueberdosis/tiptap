import { selectParentNode as originalSelectParentNode } from 'prosemirror-commands'
import { Command } from '../Editor'

type SelectParentNodeCommand = () => Command

declare module '../Editor' {
  interface Commands {
    selectParentNode: SelectParentNodeCommand,
  }
}

export const selectParentNode: SelectParentNodeCommand = () => ({ state, dispatch }) => {
  return originalSelectParentNode(state, dispatch)
}
