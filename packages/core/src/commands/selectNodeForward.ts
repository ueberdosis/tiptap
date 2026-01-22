import { selectNodeForward as originalSelectNodeForward } from '@dibdab/pm/commands'

import type { CommandSpec } from '../types.js'

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

export const selectNodeForward: CommandSpec =
  () =>
  ({ state, dispatch }) => {
    return originalSelectNodeForward(state, dispatch)
  }
