import { deleteSelection as originalDeleteSelection } from 'prosemirror-commands'
import { Command, Commands } from '../types'

/**
 * Delete the selection, if there is one.
 */
export const deleteSelection: Commands['deleteSelection'] = () => ({ state, dispatch }) => {
  return originalDeleteSelection(state, dispatch)
}

declare module '@tiptap/core' {
  interface Commands {
    deleteSelection: () => Command,
  }
}
