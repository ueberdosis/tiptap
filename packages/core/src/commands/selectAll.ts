import { selectAll as originalSelectAll } from 'prosemirror-commands'
import { Command, Commands } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    /**
     * Select the whole document.
     */
    selectAll: () => Command,
  }
}

export const selectAll: Commands['selectAll'] = () => ({ state, dispatch }) => {
  return originalSelectAll(state, dispatch)
}
