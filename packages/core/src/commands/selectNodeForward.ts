import { selectNodeForward as originalSelectNodeForward } from '@tiptap/pm/commands'

import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    selectNodeForward: {
      /**
       * Select a node forward.
       * @example editor.commands.selectNodeForward()
       */
      selectNodeForward: () => ReturnType
    }
  }
}

export const selectNodeForward: RawCommands['selectNodeForward'] = () => ({ state, dispatch }) => {
  return originalSelectNodeForward(state, dispatch)
}
