import { newlineInCode as originalNewlineInCode } from '@dibdab/pm/commands'

import type { CommandSpec } from '../types.js'

declare module '@dibdab/core' {
  interface Commands<ReturnType> {
    newlineInCode: {
      /**
       * Add a newline character in code.
       * @example editor.commands.newlineInCode()
       */
      newlineInCode: () => ReturnType
    }
  }
}

export const newlineInCode: CommandSpec =
  () =>
  ({ state, dispatch }) => {
    return originalNewlineInCode(state, dispatch)
  }
