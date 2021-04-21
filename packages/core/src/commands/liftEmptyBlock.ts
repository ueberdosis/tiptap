import { liftEmptyBlock as originalLiftEmptyBlock } from 'prosemirror-commands'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    liftEmptyBlock: {
      /**
       * Lift block if empty.
       */
      liftEmptyBlock: () => Command,
    }
  }
}

export const liftEmptyBlock: RawCommands['liftEmptyBlock'] = () => ({ state, dispatch }) => {
  return originalLiftEmptyBlock(state, dispatch)
}
