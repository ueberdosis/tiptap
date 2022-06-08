import { exitCode as originalExitCode } from 'prosemirror-commands'

import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    exitCode: {
      /**
       * Exit from a code block.
       */
      exitCode: () => ReturnType,
    }
  }
}

export const exitCode: RawCommands['exitCode'] = () => ({ state, dispatch }) => {
  return originalExitCode(state, dispatch)
}
