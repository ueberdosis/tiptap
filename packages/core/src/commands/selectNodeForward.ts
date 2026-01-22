import { selectNodeForward as originalSelectNodeForward } from '@dibdab/pm/commands'

import type { RawCommands } from '../types.js'

declare module '@dibdab/core' {
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

export const selectNodeForward: RawCommands['selectNodeForward'] =
  () =>
  ({ state, dispatch }) => {
    return originalSelectNodeForward(state, dispatch)
  }
