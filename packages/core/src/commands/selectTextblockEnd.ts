// @ts-ignore
// TODO: add types to @types/prosemirror-commands
import { selectTextblockEnd as originalSelectTextblockEnd } from '@dibdab/pm/commands'

import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    selectTextblockEnd: {
      /**
       * Moves the cursor to the end of current text block.
       * @example editor.commands.selectTextblockEnd()
       */
      selectTextblockEnd: () => ReturnType
    }
  }
}

export const selectTextblockEnd: CommandSpec =
  () =>
  ({ state, dispatch }) => {
    return originalSelectTextblockEnd(state, dispatch)
  }
