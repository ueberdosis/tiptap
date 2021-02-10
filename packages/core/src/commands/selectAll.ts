import { selectAll as originalSelectAll } from 'prosemirror-commands'
import { Command, Commands } from '../types'

/**
 * Select the whole document.
 */
export const selectAll: Commands['selectAll'] = () => ({ state, dispatch }) => {
  return originalSelectAll(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    selectAll: () => Command,
  }
}
