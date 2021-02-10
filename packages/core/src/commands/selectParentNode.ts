import { selectParentNode as originalSelectParentNode } from 'prosemirror-commands'
import { Command, Commands } from '../types'

/**
 * Select the parent node.
 */
export const selectParentNode: Commands['selectParentNode'] = () => ({ state, dispatch }) => {
  return originalSelectParentNode(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    selectParentNode: () => Command,
  }
}
