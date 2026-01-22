import { joinTextblockBackward as originalCommand } from '@dibdab/pm/commands'

import type { RawCommands } from '../types.js'

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

export const joinTextblockBackward: RawCommands['joinTextblockBackward'] =
  () =>
  ({ state, dispatch }) => {
    return originalCommand(state, dispatch)
  }
