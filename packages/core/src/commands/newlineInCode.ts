import { newlineInCode as originalNewlineInCode } from '@tiptap/pm/commands'

import { RawCommands } from '../types.js'

declare module '@tiptap/core' {
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

export const newlineInCode: RawCommands['newlineInCode'] = () => ({ state, dispatch }) => {
  return originalNewlineInCode(state, dispatch)
}
