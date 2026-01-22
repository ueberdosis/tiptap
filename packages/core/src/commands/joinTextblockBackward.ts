import { joinTextblockBackward as originalCommand } from '@dibdab/pm/commands'

import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    joinTextblockBackward: {
      /**
       * A more limited form of joinBackward that only tries to join the current textblock to the one before it, if the cursor is at the start of a textblock.
       */
      joinTextblockBackward: () => ReturnType
    }
  }
}

export const joinTextblockBackward: CommandSpec =
  () =>
  ({ state, dispatch }) => {
    return originalCommand(state, dispatch)
  }
