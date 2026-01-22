import { liftEmptyBlock as originalLiftEmptyBlock } from '@dibdab/pm/commands'

import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
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

export const liftEmptyBlock: CommandSpec =
  () =>
  ({ state, dispatch }) => {
    return originalLiftEmptyBlock(state, dispatch)
  }
