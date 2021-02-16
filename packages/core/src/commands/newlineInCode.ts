import { newlineInCode as originalNewlineInCode } from 'prosemirror-commands'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    newlineInCode: {
      /**
       * Add a newline character in code.
       */
      newlineInCode: () => Command,
    }
  }
}

export const newlineInCode: RawCommands['newlineInCode'] = () => ({ state, dispatch }) => {
  return originalNewlineInCode(state, dispatch)
}
