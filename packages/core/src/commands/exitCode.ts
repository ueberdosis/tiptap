import { exitCode as originalExitCode } from 'prosemirror-commands'
import { Command, Commands } from '../types'

/**
 * Exit from a code block.
 */
export const exitCode: Commands['exitCode'] = () => ({ state, dispatch }) => {
  return originalExitCode(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    exitCode: () => Command,
  }
}
