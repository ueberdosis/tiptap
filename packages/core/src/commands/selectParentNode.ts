import { selectParentNode as originalSelectParentNode } from 'prosemirror-commands'
import { Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    selectParentNode: {
      /**
       * Select the parent node.
       */
      selectParentNode: () => Command,
    }
  }
}

export const selectParentNode: Commands['selectParentNode'] = () => ({ state, dispatch }) => {
  return originalSelectParentNode(state, dispatch)
}
