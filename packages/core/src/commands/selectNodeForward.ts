import { selectNodeForward as originalSelectNodeForward } from 'prosemirror-commands'
import { Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    selectNodeForward: {
      /**
       * Select a node forward.
       */
      selectNodeForward: () => Command,
    }
  }
}

export const selectNodeForward: Commands['selectNodeForward'] = () => ({ state, dispatch }) => {
  return originalSelectNodeForward(state, dispatch)
}
