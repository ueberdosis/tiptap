import { liftEmptyBlock as originalLiftEmptyBlock } from 'prosemirror-commands'
import { Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    /**
     * Lift block if empty.
     */
    liftEmptyBlock: () => Command,
  }
}

export const liftEmptyBlock: Commands['liftEmptyBlock'] = () => ({ state, dispatch }) => {
  return originalLiftEmptyBlock(state, dispatch)
}
