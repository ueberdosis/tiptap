import { newlineInCode as originalNewlineInCode } from 'prosemirror-commands'
import { Command } from '../types'

/**
 * Add a newline character in code.
 */
export const newlineInCode = (): Command => ({ state, dispatch }) => {
  return originalNewlineInCode(state, dispatch)
}
