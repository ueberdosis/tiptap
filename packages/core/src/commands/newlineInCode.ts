import { newlineInCode as originalNewlineInCode } from 'prosemirror-commands'
import { Command, Commands } from '../types'

/**
 * Add a newline character in code.
 */
export const newlineInCode: Commands['newlineInCode'] = () => ({ state, dispatch }) => {
  return originalNewlineInCode(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    newlineInCode: () => Command,
  }
}
