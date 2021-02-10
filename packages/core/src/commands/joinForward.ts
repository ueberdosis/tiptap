import { joinForward as originalJoinForward } from 'prosemirror-commands'
import { Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    /**
     * Join two nodes forward.
     */
    joinForward: () => Command,
  }
}

export const joinForward: Commands['joinForward'] = () => ({ state, dispatch }) => {
  return originalJoinForward(state, dispatch)
}
