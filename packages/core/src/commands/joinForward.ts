import { joinForward as originalJoinForward } from 'prosemirror-commands'
import { Command, Commands } from '../types'

/**
 * Join two nodes forward.
 */
export const joinForward: Commands['joinForward'] = () => ({ state, dispatch }) => {
  return originalJoinForward(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    joinForward: () => Command,
  }
}
