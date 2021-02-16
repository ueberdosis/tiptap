import { joinForward as originalJoinForward } from 'prosemirror-commands'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    joinForward: {
      /**
       * Join two nodes forward.
       */
      joinForward: () => Command,
    }
  }
}

export const joinForward: RawCommands['joinForward'] = () => ({ state, dispatch }) => {
  return originalJoinForward(state, dispatch)
}
