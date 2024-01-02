import { joinTextblockForward as originalCommand } from '@tiptap/pm/commands'

import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    joinTextblockForward: {
      /**
       * A more limited form of joinForward that only tries to join the current textblock to the one after it, if the cursor is at the end of a textblock.
       */
      joinTextblockForward: () => ReturnType
    }
  }
}

export const joinTextblockForward: RawCommands['joinTextblockForward'] = () => ({ state, dispatch }) => {
  return originalCommand(state, dispatch)
}
