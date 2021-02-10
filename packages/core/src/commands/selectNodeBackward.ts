import { selectNodeBackward as originalSelectNodeBackward } from 'prosemirror-commands'
import { Command, Commands } from '../types'

/**
 * Select a node backward.
 */
export const selectNodeBackward: Commands['selectNodeBackward'] = () => ({ state, dispatch }) => {
  return originalSelectNodeBackward(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    selectNodeBackward: () => Command,
  }
}
