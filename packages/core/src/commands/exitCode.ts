import { exitCode as originalExitCode } from 'prosemirror-commands'
import { Command, Commands } from '../types'

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

export const exitCode: Commands['exitCode'] = () => ({ state, dispatch }) => {
  return originalExitCode(state, dispatch)
}
