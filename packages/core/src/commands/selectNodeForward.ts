import { selectNodeForward as originalSelectNodeForward } from 'prosemirror-commands'
import { Command, Commands } from '../types'

/**
 * Select a node forward.
 */
export const selectNodeForward: Commands['selectNodeForward'] = () => ({ state, dispatch }) => {
  return originalSelectNodeForward(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    selectNodeForward: () => Command,
  }
}
