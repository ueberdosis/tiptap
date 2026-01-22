import { selectNodeBackward as originalSelectNodeBackward } from '@dibdab/pm/commands'

import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
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

export const selectNodeBackward: CommandSpec =
  () =>
  ({ state, dispatch }) => {
    return originalSelectNodeBackward(state, dispatch)
  }
