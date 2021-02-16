import { selectNodeForward as originalSelectNodeForward } from 'prosemirror-commands'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    selectNodeForward: {
      /**
       * Select a node forward.
       */
      selectNodeForward: () => Command,
    }
  }
}

export const selectNodeForward: RawCommands['selectNodeForward'] = () => ({ state, dispatch }) => {
  return originalSelectNodeForward(state, dispatch)
}
