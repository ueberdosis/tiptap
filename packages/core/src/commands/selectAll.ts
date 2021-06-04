import { selectAll as originalSelectAll } from 'prosemirror-commands'
import { RawCommands } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    selectAll: {
      /**
       * Select the whole document.
       */
      selectAll: () => ReturnType,
    }
  }
}

export const selectAll: RawCommands['selectAll'] = () => ({ state, dispatch }) => {
  return originalSelectAll(state, dispatch)
}
