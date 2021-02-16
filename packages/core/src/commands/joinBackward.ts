import { joinBackward as originalJoinBackward } from 'prosemirror-commands'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    joinBackward: {
      /**
       * Join two nodes backward.
       */
      joinBackward: () => Command,
    }
  }
}

export const joinBackward: RawCommands['joinBackward'] = () => ({ state, dispatch }) => {
  return originalJoinBackward(state, dispatch)
}
