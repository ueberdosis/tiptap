import { exitCode as originalExitCode } from 'prosemirror-commands'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    exitCode: {
      /**
       * Exit from a code block.
       */
      exitCode: () => Command,
    }
  }
}

export const exitCode: RawCommands['exitCode'] = () => ({ state, dispatch }) => {
  return originalExitCode(state, dispatch)
}
