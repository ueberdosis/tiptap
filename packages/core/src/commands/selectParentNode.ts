import { selectParentNode as originalSelectParentNode } from 'prosemirror-commands'

import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    selectParentNode: {
      /**
       * Select the parent node.
       */
      selectParentNode: () => ReturnType,
    }
  }
}

export const selectParentNode: RawCommands['selectParentNode'] = () => ({ state, dispatch }) => {
  return originalSelectParentNode(state, dispatch)
}
