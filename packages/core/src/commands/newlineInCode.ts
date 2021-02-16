import { newlineInCode as originalNewlineInCode } from 'prosemirror-commands'
import { Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    newlineInCode: {
      /**
       * Add a newline character in code.
       */
      newlineInCode: () => Command,
    }
  }
}

export const newlineInCode: Commands['newlineInCode'] = () => ({ state, dispatch }) => {
  return originalNewlineInCode(state, dispatch)
}
