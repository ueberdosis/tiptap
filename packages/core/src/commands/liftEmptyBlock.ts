import { liftEmptyBlock as originalLiftEmptyBlock } from '@tiptap/pm/commands'

import type { RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    liftEmptyBlock: {
      /**
       * If the cursor is in an empty textblock that can be lifted, lift the block.
       * @example editor.commands.liftEmptyBlock()
       */
      liftEmptyBlock: () => ReturnType
    }
  }
}

export const liftEmptyBlock: RawCommands['liftEmptyBlock'] =
  () =>
  ({ state, dispatch }) => {
    return originalLiftEmptyBlock(state, dispatch)
  }
