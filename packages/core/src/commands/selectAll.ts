import { selectAll as originalSelectAll } from 'prosemirror-commands'
import { Command, RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    selectAll: {
      /**
       * Select the whole document.
       */
      selectAll: () => Command,
    }
  }
}

export const selectAll: RawCommands['selectAll'] = () => ({ state, dispatch }) => {
  return originalSelectAll(state, dispatch)
}
