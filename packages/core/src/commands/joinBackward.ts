import { joinBackward as originalJoinBackward } from 'prosemirror-commands'
import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    joinBackward: {
      /**
       * Join two nodes backward.
       */
      joinBackward: () => ReturnType,
    }
  }
}

export const joinBackward: RawCommands['joinBackward'] = () => ({ state, dispatch }) => {
  return originalJoinBackward(state, dispatch)
}
