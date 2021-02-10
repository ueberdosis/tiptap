import { liftEmptyBlock as originalLiftEmptyBlock } from 'prosemirror-commands'
import { Command, Commands } from '../types'

/**
 * Lift block if empty.
 */
export const liftEmptyBlock: Commands['liftEmptyBlock'] = () => ({ state, dispatch }) => {
  return originalLiftEmptyBlock(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    liftEmptyBlock: () => Command,
  }
}
