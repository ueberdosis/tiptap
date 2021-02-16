import { joinBackward as originalJoinBackward } from 'prosemirror-commands'
import { Command, Commands } from '../types'

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

export const joinBackward: Commands['joinBackward'] = () => ({ state, dispatch }) => {
  return originalJoinBackward(state, dispatch)
}
