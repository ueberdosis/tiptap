import { exitCode as originalExitCode } from '@tiptap/pm/commands'

import type { RawCommands } from '../types.js'

declare module '@tiptap/editor' {
  interface Commands<ReturnType> {
    exitCode: {
      /**
       * Exit from a code block.
       * @example editor.commands.exitCode()
       */
      exitCode: () => ReturnType
    }
  }
}

export const exitCode: RawCommands['exitCode'] =
  () =>
  ({ state, dispatch }) => {
    return originalExitCode(state, dispatch)
  }
