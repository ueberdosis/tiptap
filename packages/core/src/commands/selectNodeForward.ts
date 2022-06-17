import { selectNodeForward as originalSelectNodeForward } from 'prosemirror-commands'

import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    selectNodeForward: {
      /**
       * Select a node forward.
       */
      selectNodeForward: () => ReturnType,
    }
  }
}

export const selectNodeForward: RawCommands['selectNodeForward'] = () => ({ state, dispatch }) => {
  return originalSelectNodeForward(state, dispatch)
}
