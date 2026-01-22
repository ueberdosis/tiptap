import { newlineInCode as originalNewlineInCode } from '@dibdab/pm/commands'

import type { RawCommands } from '../types.js'

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

export const newlineInCode: RawCommands['newlineInCode'] =
  () =>
  ({ state, dispatch }) => {
    return originalNewlineInCode(state, dispatch)
  }
