import { exitCode as originalExitCode } from 'prosemirror-commands'
import { Command } from '../types'

/**
 * Exit from a code block.
 */
export const exitCode = (): Command => ({ state, dispatch }) => {
  return originalExitCode(state, dispatch)
}
