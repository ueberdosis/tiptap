import { selectNodeBackward as originalSelectNodeBackward } from 'prosemirror-commands'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    selectNodeBackward: {
      /**
       * Select a node backward.
       */
      selectNodeBackward: () => Command,
    }
  }
}

export const selectNodeBackward: RawCommands['selectNodeBackward'] = () => ({ state, dispatch }) => {
  return originalSelectNodeBackward(state, dispatch)
}
