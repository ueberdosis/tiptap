import { joinBackward as originalJoinBackward } from 'prosemirror-commands'
import { Command, Commands } from '../types'

/**
 * Join two nodes backward.
 */
export const joinBackward: Commands['joinBackward'] = () => ({ state, dispatch }) => {
  return originalJoinBackward(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    joinBackward: () => Command,
  }
}
