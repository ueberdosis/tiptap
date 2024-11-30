import { selectNodeBackward as originalSelectNodeBackward } from '@tiptap/pm/commands'

import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    selectNodeBackward: {
      /**
       * Select a node backward.
       * @example editor.commands.selectNodeBackward()
       */
      selectNodeBackward: () => ReturnType
    }
  }
}

export const selectNodeBackward: RawCommands['selectNodeBackward'] = () => ({ state, dispatch }) => {
  return originalSelectNodeBackward(state, dispatch)
}
