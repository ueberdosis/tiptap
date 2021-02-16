import { selectNodeBackward as originalSelectNodeBackward } from 'prosemirror-commands'
import { Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    selectNodeBackward: {
      /**
       * Select a node backward.
       */
      selectNodeBackward: () => Command,
    }
  }
}

export const selectNodeBackward: Commands['selectNodeBackward'] = () => ({ state, dispatch }) => {
  return originalSelectNodeBackward(state, dispatch)
}
